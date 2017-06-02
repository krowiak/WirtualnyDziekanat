'use strict';

const express = require('express');
const router = express.Router();
const subjects = require('../models/subject');
const users = require('../models/user');

function getSubjects(query, userId) {
    const ordering = query.orderBy || [['year', 'ASC'], ['term', 'ASC']];
    return subjects.Subject.findAll({
        where: query.where,
        attributes: subjects.Subject.publicFields,
        offset: query.offset,
        limit: query.limit,
        order: ordering,
        include: [{
            model: users.User,
            attributes: users.publicFields,
            where: { id: userId }
        }]
    });
}


function sendSubjects(res, subjects) {
    res.send(subjects);
}

function cleanSubjectsData(subjectArray) {
    const results = [];
    for (let i = 0; i < subjectArray.length; i++)
    {
        let subject = subjectArray[i];
        let cleanSubject = subjects.extractPublicFields(subject);
        //cleanSubject.users = subject.users.map((user) => users.extractPublicFields(user));
        results.push(cleanSubject);
    }
    return results;
}

router.get('/', function(req, res, next) {
    getSubjects(req.query, req.user.id)
    .then((subjects) => cleanSubjectsData)
    .then((subjects) => sendSubjects(res, subjects));
});

module.exports = router;