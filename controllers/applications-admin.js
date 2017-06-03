'use strict';

const express = require('express');
const router = express.Router();
const applications = require('../models/application');
const users = require('../models/user');
const s = require('sprintf-js');
const ApplicationDoesNotExitError = require('../models/errors/application-does-not-exist');
const IllegalApplicationStatusChangeError = require('../models/errors/illegal-application-status-change');
const SequelizeValidationError = require('sequelize').ValidationError;
const logger = require('winston');

function getApplications(query) {
    const ordering = query.orderBy || [['created_at', 'DESC']];
    return applications.Application.findAll({
        where: query.where,
        attributes: applications.publicFields,
        offset: query.offset,
        limit: query.limit,
        order: ordering,
        include: [{
            model: users.User,
            attributes: users.publicFields
        }]
    });
}

function getOneApplication(applicationId) {
    return applications.Application.findOne({
        where: { id: applicationId },
        attributes: applications.publicFields
    });
}

router.get('/', function(req, res, next) {
    getApplications(req.query)
        .then((applications) => res.send(applications));
});

router.get('/:applicationId', function(req, res, next) {
    const applicationId = req.params.applicationId;
    
    getOneApplication(applicationId)
        .then((application) => {
            if (application) {
                res.send(application);
            } else {
                res.send({ 
                    type: 'warning', 
                    message: s.sprintf('Brak podania o ID %s.', applicationId)
                });
            }
        });
});

router.post('/changeStatus', function(req, res, next) {
    const applicationId = req.body.applicationId;
    const newStatus = req.body.newStatus;
    
    applications.changeStatus(applicationId, newStatus)
        .then((application) => res.send(application))
        .catch(ApplicationDoesNotExitError, (err) => {
            res.send({ type: 'warning', message: 'Wskazane podanie nie istnieje.' });
        }).catch(IllegalApplicationStatusChangeError, (err) => {
            res.send({ type: 'warning', message: 'Nie można zmienić statusu podania na wskazany.' });
        }).catch(SequelizeValidationError, (err) => {
            res.send({ type: 'error', message: 'Podany status jest niepoprawny.' });
        }).catch((err) => {
            logger.error('Zmiana statusu: %s', err);
            res.send({ type: 'error', message: 'Nie udało się zmienić statusu. Spróbuj ponownie później.' });
        });
});

module.exports = router;