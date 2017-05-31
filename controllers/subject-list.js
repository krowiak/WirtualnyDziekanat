'use strict';

const express = require('express');
const router = express.Router();
const subjects = require('../models/subject');
// "Nieużywane, to można wywalić", można pomyśleć, ale Sequelize jest zbyt głupie.
// Bez tego wykrzaczy się na joinach.
const userSubjects = require('../models/user-subjects');
const users = require('../models/user');
const SubjectAlreadyExistsError = require('../models/errors/subject-already-exists');
const SequelizeValidationError = require('sequelize').ValidationError;
const logger = require('winston');
const s = require('sprintf-js');
const connection = require('../database/connection').connection;
const _ = require('lodash');

const getUsersSubjects = '/user/:user';
const getLimitSyntax = '/offset/:offset/limit/:limit';

// Prawdopodobnie przydałaby się jakaś bardziej złożona logika tutaj, 
// np. student należy do przedmiotu+nauczyciela, rozróżnienie wykładowca/ćwiczeniowiec?
// Ale jesteśmy trosik do tyłu, a w wymaganiach nic nie ma, więęęc.

function sendSubjects(req, res, subjects) {
    res.send(subjects);
};

function currySendSubjects(req, res) {
    return (subjects) => sendSubjects(req, res, subjects);
};

router.get(['/', getLimitSyntax], function(req, res, next) {
    subjects.Subject.findAll({
        offset: req.params.offset,
        limit: req.params.limit,
        attributes: subjects.publicFields
    }).then(currySendSubjects(req, res));
});

// Do kosza, ale dopóki nie mamy faktycznego niczego...
router.get('/frontend', function(req, res, next) {
    subjects.Subject.findAll({
        offset: req.params.offset,
        limit: req.params.limit,
        attributes: subjects.publicFields
    }).then(
        (subjects) => {
            req.viewData.subjects = subjects;
            res.render('subject-list', req.viewData);
        }
    );
});

router.get([getUsersSubjects, getUsersSubjects + getLimitSyntax], function(req, res, next) {
    subjects.Subject.findAll({
        include: [{
            model: users.User,
            where: { id: req.params.user }
        }],
        offset: req.params.offset,
        limit: req.params.limit,
        attributes: subjects.publicFields
    }).then(currySendSubjects(req, res));
});

router.post('/add-subject', function(req, res, next) {
    const name = req.body.name;
    subjects.createNewSubject(name).then((subject) => {
        res.send({ type: 'info', message: s.sprintf('Dodano przedmiot "%s".', name) })
    }).catch(SubjectAlreadyExistsError, function(err) {
        res.send({ type: 'warning', message: 'Przedmiot o podanej nazwie już istnieje.' })
    }).catch(SequelizeValidationError, function(err) {
        logger.debug('Dodawanie przedmiotu - błąd walidacji modelu: %s', err.message);
        const errors = err.errors;
        if (errors.length === 1) {
            res.send({ type: 'warning', message: errors[0].message });
        } else {
            res.send({ type: 'warning', message: s.sprintf('%i błędów, w tym: "%s"', errors.length, 
                errors[0].message) });
        }
    }).catch(function(err) {
        logger.error('Dodawanie przedmiotu - błąd: %s', err);
        res.send({ type: 'error', message: 'Błąd dodawania przedmiotu. Moze następnym razem pójdzie lepiej!' });
    });
});

router.post('/delete-subject', function(req, res, next) {
    const id = req.body.id;
    subjects.Subject.findOne({where: { id: id }}).then((subject) => {
        if (subject) {
            const name = subject.name;
            subject.destroy().then((_) => {
               res.send({ type: 'info', message: s.sprintf('Przedmiot "%s" został usunięty.', name)});
            });
        } else {
            res.send({ type: 'warning', message: 'Wskazany przedmiot nie istnieje.' });
        }
    });
});

function getSubjectsByIds(ids) {
    return subjects.Subject.findAll({
        where: { 
            id: {
                $in: ids
            }
        }
    });
}

// To całe jest właściwie identyczne z kodem dla uzytkowników, później by to można wydzielić...
router.post('/change-subjects', function(req, res, next) {
    const changes = req.body.changes;
    if (changes) {
        const changedObjIds = changes.map((obj) => obj.id);
        logger.debug('Id zmienionych obiektów: %s', changedObjIds);
        connection.transaction(function(t) {
            return getSubjectsByIds(changedObjIds).then((users) => {
                const subjectsByIds = _.keyBy(users, 'id');
                for (let changedSubject of changes) {
                    for (let changedFieldKey of Object.keys(changedSubject)) {
                        if (changedFieldKey !== 'id') {
                            subjectsByIds[changedSubject.id][changedFieldKey] = changedSubject[changedFieldKey];
                            logger.info('Id %s - %s: %s', changedSubject.id, changedFieldKey, changedSubject[changedFieldKey]);
                        }
                    }
                    subjectsByIds[changedSubject.id].save();
                }
            });
        }).then(() => {
            res.send({ type: 'info', message: 'Zmiany zostały zapisane.' });
        });
    } else {
        logger.debug('Brak zmian przedmiotów.');
        res.send({ type: 'warning', message: 'Brak zmian do wprowadzenia.' });
    }
});

module.exports = router;