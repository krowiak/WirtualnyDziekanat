'use strict';

const express = require('express');
const router = express.Router();
const subjects = require('../models/subject');
const users = require('../models/user');
const userRoles = require('../models/user-roles');
const grades = require('../models/grade');
const GradeTargetInvalid = require('../models/errors/grade-target-invalid');
const GradeAlreadyExists = require('../models/errors/grade-already-exists');
const logger = require('winston');
const Promise = require('bluebird');

function getSubjects(query, userId) {
    const ordering = query.orderBy || [['year', 'ASC'], ['term', 'ASC']];
    const where = query.where || {};
    return subjects.Subject.findAll({
        where: where,
        attributes: subjects.Subject.publicFields,
        offset: query.offset,
        limit: query.limit,
        order: ordering,
        include: [{
            model: users.User,
            attributes: users.publicFields,
            where: { id: userId }//{ role: userRoles.Student }
        }]
    });
}


function sendSubjects(res, subjects) {
    res.send(subjects);
}

function addUserData(subjectArray) {
    return Promise.map(subjectArray, (subject) => {
        return subject.getUsers({
            where: { role: userRoles.Student },
            include: [{ model: grades.Grade, attributes: grades.publicFields }]
        }).then((users) => {return {subject: subjects.extractPublicFields(subject), users: users}});
    }).map((subjUser) => {
        subjUser.subject.users = subjUser.users.map((user) => {
            const extracted = users.extractPublicFields(user);
            extracted.grades = user.grades;
            return extracted;
        });
        return subjUser.subject;
    });
}

router.get('/', function(req, res, next) {
    getSubjects(req.query, req.user.id)
        .then(addUserData)
        .then((subjects) => sendSubjects(res, subjects));
});

router.get('/:subjectId', function(req, res, next) {
    const where = req.query.where || {};
    where.id = req.params.subjectId;
    req.query.where = where;
    
    getSubjects(req.query, req.user.id)
        .then(addUserData)
        .then((subjects) => sendSubjects(res, subjects));
});

router.post('/grade', function (req, res, next) {
    const userId = req.body.userId;
    const subjectId = req.body.subjectId;
    const grade = req.body.grade;
    const attempt = req.body.attempt;
    const handleExpectedError = function (err) {
        logger.warn('Bład dodawania oceny: %s', err);
        res.send({ type: 'warning', message: err.message });
    };
    
    grades.addGrade(userId, subjectId, grade, attempt)
        .then((grade) => res.send(grades.extractPublicFields(grade)))
        .catch(GradeTargetInvalid, handleExpectedError)
        .catch(GradeAlreadyExists, handleExpectedError)
        .catch((err) => {
            logger.error('Bład dodawania oceny: %s', err);
            res.send({ 
                type: 'error', 
                message: 'Nie udało się przypisać oceny. Spróbuj ponownie później.' 
            });
        });
});

module.exports = router;