'use strict';

const express = require('express');
const router = express.Router();
const applications = require('../models/application');
const users = require('../models/user');
const logger = require('winston');
const ApplicationContentInvalidError = require('../models/errors/application-content-invalid');
const moment = require('moment');

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

function getOneApplication(applicationId) {
    return applications.Application.findOne({
        where: {
            id: applicationId
        },
        include: {
            model: users.User
        }
    });
}

function handleNoSuchApplication(res, application) {
    if (!application) {
        res.send({ type: 'warning', message: 'Wskazane podanie nie istnieje.' })
    }
    return application;
}

router.get('/', function(req, res, next) {
    getApplications(req.query, req.user.id)
        .then((applications) => res.send(applications));
});

router.get('/pdf/:applicationId', function(req, res, next) {
    getOneApplication(req.params.applicationId)
        .then((application) => handleNoSuchApplication(res, application))
        .then((application) => {
            if (application) {
                res.attachment('super.pdf');
                applications.toPdf(application, res);
            }
            return true;  // Obietnice muszą coś zwracać jeśli obsługa błędów itd. ma działać
        }).catch((err) => {
            logger.error('Błąd tworzenia PDFa: %s', err);
            res.send({ 
                type: 'error', 
                message: 'Nie udało się wygenerować pliku z podaniem. Spróbuj ponownie później.' 
            });
        });
});

router.get('/new', function(req, res, next) {
    res.render('application-create', req.viewData);
});

router.post('/new', function(req, res, next) {
    applications.createNewApplication(req.body)
        .then((app) => res.send(app))
        .catch(ApplicationContentInvalidError, (err) => {
            res.send({ type: 'error', message: err.message });
        })
        .catch((err) => {
            logger.error('Błąd tworzenia podania: %s', err);
            res.send({ type: 'error', message: 'Nie udało się złożyć podania. Spróbuj ponownie później.' });
        });
});

router.get('/:applicationId', function(req, res, next) {
    getOneApplication(req.params.applicationId)
        .then((application) => handleNoSuchApplication(res, application))
        .then((application) => {
            if (application) {
                req.viewData.reason = application.reason;
                req.viewData.who = application.user;
                req.viewData.body = JSON.parse(application.body);
                if (application.body.until) {
                    req.viewData.body.until = moment(application.body.until).format('DD.MM.YYYY');
                }
                res.render('application-display', req.viewData);
            }
        });
});

module.exports = router;