'use strict';

const express = require('express');
const router = express.Router();
const grades = require('../models/grade');
const users = require('../models/user');
const subjects = require('../models/subject');
const currentTerm = require('../models/current-term');
const helpers = require('./helpers');

function getSubjects(query, userId) {
    const ordering = query.orderBy || [['year', 'DESC'], ['term', 'DESC']];
    return subjects.Subject.findAll({
        where: query.where,
        attributes: subjects.publicFields,
        offset: query.offset,
        limit: query.limit,
        order: ordering,
        include: [{
            model: grades.Grade,
            attributes: grades.publicFields,
            where: { userId: userId },
            required: false,
            order: [['attempt', 'ASC']]
        },
        {
            model: users.User,
            attributes: users.publicFields,
            where: { id: userId }
        }]
    });
}


function sendSubjects(res, subjects) {
    res.send(subjects);
}

function displaySubjects(req, res, subjects) {
    const viewData = req.viewData;
    viewData.subjects = subjects;
    res.render('subject-list', viewData);
}

function removeUserData(subjectArray) {
    const results = [];
    for (let i = 0; i < subjectArray.length; i++)
    {
        let subject = subjectArray[i];
        let cleanSubject = subjects.extractPublicFields(subject);
        cleanSubject.grades = subject.grades;
        results.push(cleanSubject);
    }
    return results;
}

function getAndSendSubjects(req, res) {
    getSubjects(req.query, req.user.id)
        .then(removeUserData)
        .then((subjects) => sendSubjects(res, subjects));
}

function getAndDisplaySubjects(req, res) {
    getSubjects(req.query, req.user.id)
        .then(removeUserData)
        .then((subjects) => displaySubjects(req, res, subjects));
}

router.get('/', function(req, res, next) {
    currentTerm.getCurrent().then((current) => {
        if (current) {
            const where = req.query.where || {};
            where.year = current.year;
            where.term = current.term;
            req.query.where = where;
            getAndDisplaySubjects(req, res);
        } else {
            helpers.renderMessage(req, res, { 
                type: 'warning', 
                message: 'Nie udało się ustalić listy aktualnych przedmiotów. Skontaktuj się z administratorem.' 
            });
        }
    })
});

router.get('/history', function(req, res, next) {
    getAndDisplaySubjects(req, res);
});

module.exports = router;