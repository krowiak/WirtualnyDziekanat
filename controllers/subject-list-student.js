'use strict';

const express = require('express');
const router = express.Router();
const grades = require('../models/grade');
const users = require('../models/user');
const subjects = require('../models/subject');

function getSubjects(query, userId) {
    const ordering = query.orderBy || [['year', 'ASC'], ['term', 'ASC']];
    return subjects.Subject.findAll({
        where: query.where,
        attributes: subjects.publicFields,
        offset: query.offset,
        limit: query.limit,
        order: ordering,
        include: [{
            model: grades.Grade,
            attributes: grades.publicFields
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

router.get('/', function(req, res, next) {
    getSubjects(req.query, req.user.id)
        .then(removeUserData)
        .then((subjects) => sendSubjects(res, subjects));
});

module.exports = router;