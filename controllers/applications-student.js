'use strict';

const express = require('express');
const router = express.Router();
const applications = require('../models/application');
const users = require('../models/user');
const logger = require('winston');

function getApplications(query, userId) {
    const ordering = query.orderBy || [['created_at', 'DESC']];
    const where = query.where || {};
    where.userId = userId;
    return applications.Application.findAll({
        where: where,
        attributes: applications.publicFields,
        offset: query.offset,
        limit: query.limit,
        order: ordering
    });
}

router.get('/', function(req, res, next) {
    getApplications(req.query, req.user.id)
        .then((applications) => res.send(applications));
});

router.post('/new', function(req, res, next) {
    applications.createNewApplication(req.body)
        .then((app) => res.send(app))
        .catch()
        .catch((err) => {
            logger.error('Błąd tworzenia podania: %s', err);
            res.send({ type: 'error', message: 'Nie udało się złożyć podania. Spróbuj ponownie później.' });
        });
});

module.exports = router;