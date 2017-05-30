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

function displaySubjects(req, res, subjects) {
    req.viewData.subjects = subjects;
    res.render('subject-list', req.viewData);
};

function curryDisplaySubjects(req, res) {
    return (subjects) => displaySubjects(req, res, subjects);
};

router.get(['/', getLimitSyntax], function(req, res, next) {
    subjects.Subject.findAll({
        offset: req.params.offset,
        limit: req.params.limit,
        attributes: subjects.publicFields
    }).then(curryDisplaySubjects(req, res));
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
    }).then(curryDisplaySubjects(req, res));
});

router.post('/add-subject', function(req, res, next) {
    const name = req.body.name;
    subjects.createNewSubject(name).then((subject) => {
        req.flash('info', s.sprintf('Dodano przedmiot "%s".', name));
        res.redirect('back');
    }).catch(SubjectAlreadyExistsError, function(err) {
        req.flash('warning', 'Przedmiot o podanej nazwie już istnieje.');
        res.redirect('back');
    }).catch(SequelizeValidationError, function(err) {
        logger.debug('Dodawanie przedmiotu - błąd walidacji modelu: %s', err.message);
        const errors = err.errors;
        if (errors.length === 1) {
            req.flash('warning', errors[0].message);
        } else {
            req.flash('warning', s.sprintf('%i błędów, w tym: "%s"', errors.length, 
            errors[0].message));
        }
        res.redirect('back');
    }).catch(function(err) {
        logger.error('Dodawanie przedmiotu - błąd: %s', err);
        req.flash('error', 'Błąd dodawania przedmiotu. Moze następnym razem pójdzie lepiej!');
        res.redirect('back');
    });
});

router.post('/delete-subject', function(req, res, next) {
    const id = req.body.id;
    subjects.Subject.findOne({where: { id: id }}).then((subject) => {
        if (subject) {
            const name = subject.name;
            subject.destroy().then((_) => {
               req.flash('info', s.sprintf('Przedmiot "%s" został usunięty.', name));
               res.send('back');  // Źle ^_~
            });
        } else {
            req.flash('warning', 'Wskazany przedmiot nie istnieje.');
            res.send('back');  // źLE ~_^
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
            req.flash('info', 'Zmiany zostały zapisane.');
            res.send('/');  // Źle
        });
    } else {
        logger.debug('Brak zmian przedmiotów.');
        req.flash('info', 'Brak zmian do wprowadzenia.');
        res.send('back');  // Nadal źle
    }
});

module.exports = router;