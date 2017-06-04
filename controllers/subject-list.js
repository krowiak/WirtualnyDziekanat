'use strict';

const express = require('express');
const router = express.Router();
const subjects = require('../models/subject');
// "Nieużywane, to można wywalić", można pomyśleć, ale Sequelize jest zbyt głupie.
// Bez tego wykrzaczy się na joinach.
const userSubjects = require('../models/user-subjects');
const users = require('../models/user');
const userRoles = require('../models/user-roles');
const grades = require('../models/grade');
const SubjectAlreadyExistsError = require('../models/errors/subject-already-exists');
const SequelizeValidationError = require('sequelize').ValidationError;
const SubjectDoesNotExistError = require("../models/errors/subject-does-not-exist");
const UserDoesNotExistError = require("../models/errors/user-does-not-exist");
const CannotAssignRoleToSubjectError = require("../models/errors/cannot-assign-role-to-subject");
const logger = require('winston');
const s = require('sprintf-js');
const connection = require('../database/connection').connection;
const _ = require('lodash');
const Promise = require("bluebird");

function getSubjects(query) {
    const ordering = query.orderBy || [['year', 'ASC'], ['term', 'ASC']];
    return subjects.Subject.findAll({
        where: query.where,
        attributes: subjects.publicFields,
        offset: query.offset,
        limit: query.limit,
        order: ordering
    });
}

function getSubjectsByIds(ids) {
    return subjects.Subject.findAll({
        where: { 
            id: {
                $in: ids
            }
        }
    });
}

function showSubjects(req, res, subjects) {
    req.viewData.subjects = subjects;
    req.viewData.terms = [{'id': 1, 'name': 'zimowy'}, {'id': 2, 'name': 'letni'}];
    res.render('subject-list', req.viewData);
};

function curryShowSubjects(req, res) {
    return (subjects) => showSubjects(req, res, subjects);
};

function sendSubjects(req, res, subjects) {
    res.send(subjects);
};

function currySendSubjects(req, res) {
    return (subjects) => sendSubjects(req, res, subjects);
};

router.get('/', function(req, res, next) {
    getSubjects(req.query)
        .then(curryShowSubjects(req, res));
});

router.get('/:subjectId', function(req, res, next) {
    getSubjectsByIds([req.params.subjectId])
        .then(curryShowSubject(req, res));
});

function curryShowSubject(req,res, subject){
    return (subject) => showSubject(req, res, subject);
}
function showSubject(req, res, subject){
    req.viewData.subject = subject[0];
    if(subject[0])
        res.render('subject-editor', req.viewData);
    else
        res.send({ type: 'warning', message: "Wrong subject id"});
}

router.get('/backend', function(req, res, next) {
    getSubjects(req.query)
        .then(currySendSubjects(req, res));
});

router.post('/add-subject', function(req, res, next) {
    const subjectData = {
        name: req.body.name || '',
        year: req.body.year,
        term: req.body.term
    };
    logger.info(subjectData);
    subjects.createNewSubject(subjectData).then((subject) => {
        res.send({ type: 'info', message: s.sprintf('Dodano przedmiot "%s".', subjectData.name) })
    }).catch(SubjectAlreadyExistsError, function(err) {
        res.send({ type: 'warning', message: 'Przedmiot o podanej nazwie już istnieje dla podanego semestru.' })
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

router.post('/assign-users', function(req, res, next) {
    const subjectId = req.body.subjectId;
    const userIds = req.body.users;
    
    connection.transaction((transaction) => {
        return Promise.map(userIds, (userId) => userSubjects.add(subjectId, userId));
    }).then((_) => {
        logger.info('Użytkownicy przypisani do przedmiotu');
        const message = userIds.length == 1 ?
            'Użytkownik został przypisany do przedmiotu.' :
            'Użytkownicy zostali przypisani do przedmiotu.';
        res.send({ type: 'info', message: message});
    }).catch(SubjectDoesNotExistError, function (err) {
        logger.warn('Przypisywanie uzytkowników do przedmiotu - przedmiot %s nie istnieje.', err.subjectId);
        res.send({ type: 'error', message: 'Podany przedmiot nie istnieje.' });
    }).catch(UserDoesNotExistError, function (err) {
        logger.warn('Przypisywanie uzytkowników do przedmiotu - użytkownik %s nie istnieje.', err.userId);
        res.send({ type: 'error', message: 'Co najmniej jeden z podanych użytkowników nie istnieje.' });
    }).catch(CannotAssignRoleToSubjectError, function(err) {
        res.send({ type: 'error', message: err.message });
    }).catch(function (err) {
        logger.error('Przypisywanie uzytkowników do przedmiotu - błąd: %s', err);
        res.send({ type: 'error', message: 'Błąd przypisywania użytkownika do przedmiotu. Spróbuj ponownie za jakiś czas.' });
    });
});

router.post('/remove-users', function(req, res, next) {
    const subjectId = req.body.subjectId;
    const userIds = req.body.users;
    
    connection.transaction((transaction) => {
        return userSubjects.UserSubjects.destroy({
            where: {
                subjectId: subjectId,
                userId: {
                    $in: userIds
                }
            }
        });
    }).then((_) => {
        const message = userIds.length == 1 ?
            'Użytkownik został wypisany z przedmiotu.' :
            'Użytkownicy zostali wypisani z przedmiotu.';
        res.send({ type: 'info', message: message});
    }).catch(function (err) {
        logger.error('Usuwanie użytkowników z przedmiotu - błąd: %s', err);
        res.send({ type: 'error', message: 'Błąd wypisywania użytkownika z przedmiotu. Spróbuj ponownie za jakiś czas.' });
    });
});

router.get('/users/:subjectId', function(req, res, next) {
    getSubjectsByIds([req.params.subjectId])
        .then((subjects) => subjects[0].getUsers())
        .then((userList) => userList.map(user => users.extractPublicFields(user)))
        .then((userList) => res.send(userList));
});

function createUserGradeObjects(user) {
    const userJson = user.toJSON();
    const grades = userJson.grades;
    const objects = [];
    const createUserGradeObject = function (userJsonuser, grade) {
        return {
            gradeId: grade.id,
            userId: userJson.id,
            firstName: user.firstName,
            lastName: userJson.lastName,
            attempt: grade.attempt,
            grade: grade.grade
        };
    };
    
    if (grades && grades.length > 0) {
        if (grades[0].attempt === 2) {
            objects.push(createUserGradeObject(userJson, {attempt: 1, grade: 2.0}));
        } else {
            objects.push(createUserGradeObject(userJson, grades[0]));
            if (grades.length === 2) {
                objects.push(createUserGradeObject(userJson, grades[1]));
            }
        }
    }
    
    return objects;
}

function getMaxAttempt(attempts) {
    return attempts.length === 1 ? attempts[0] : attempts[1];
}


function getSubjectWithGrades(subjectId) {
    return subjects.Subject.findOne({
        where: { id: subjectId },
        attributes: subjects.publicFields,
        include: [{
            model: users.User,
            where: { role: userRoles.Student },
            attributes: ['id', 'firstName', 'lastName'],
            order: ['lastName', 'ASC'],
            include: [{ 
                model: grades.Grade,
                attributes: grades.publicFields,
                where: { subjectId: subjectId },
                order: ['attempt', 'ASC'],
                required: false
            }],
        }],
    });
}

function generateStats(userGrades, highestAttempts) {
    const average = function (userGrades) {
        let avg = 0;
        if (userGrades.length > 0) {
            avg = _.chain(userGrades)
                .map((userGrade) => userGrade.grade)
                .reduce((sum, x) => sum + x) / userGrades.length;
        }
        return avg;
    }
    const checkIfPassed = (userGrade) => userGrade.grade > 2.0;
    
    const stats = {};
    const firstAttempts = _.filter(userGrades, (userGrade) => userGrade.attempt === 1);
    stats.avgFirst = average(firstAttempts);
    stats.avgSecond = average(_.filter(userGrades, 
        (userGrade) => userGrade.attempt === 2));
    stats.avgTotal = average(highestAttempts);
    stats.numPassedFirst = _.filter(firstAttempts, checkIfPassed).length;
    stats.numPassedAny = _.filter(highestAttempts, checkIfPassed).length;
    return stats;
}

router.get('/report/:subjectId', function(req, res, next) {
    getSubjectWithGrades(req.params.subjectId)
        .then((subject) => {
            if (!subject) {
                res.send({ type: 'warning', message: 'Wskazany przedmiot nie istnieje' });
            } else {
                const gradesByUser = subject.users.map(createUserGradeObjects);
                const highestAttemptsArray = _.map(gradesByUser, getMaxAttempt);
                const userGrades = _.flatten(gradesByUser);
                const viewData = req.viewData;
                viewData.subject = subject;
                viewData.userGrades = userGrades;
                viewData.stats = generateStats(userGrades, highestAttemptsArray);
                res.render('report', viewData);
                //res.send(userGrades);
            }
        });
        
        
});

module.exports = router;