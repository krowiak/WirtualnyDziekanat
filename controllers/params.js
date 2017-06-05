'use strict';

var express = require('express');
var router = express.Router();
const logger = require('winston');
const _ = require('lodash');
const currentTerm = require('../models/current-term');
const SequelizeValidationError = require('sequelize').ValidationError;
const moment = require('moment');

router.get('/', function(req, res, next) {
    const viewData = req.viewData;
    currentTerm.getCurrent().then((current) => {
        if (current) {
            logger.warn(current.toJSON());
            viewData.current = current;
        } else {
            viewData.current = { year: moment().year(), term: 1 };
        }
        res.render('params', viewData);
    });
});

router.post('/current', function(req, res, next) {
    const year = req.body.year;
    const term = req.body.term;
    currentTerm
        .setCurrent(year, term)
        .then((current) => res.send(current))
        .catch(SequelizeValidationError, (err) => {
            res.send({ type: 'warning', message: err.message });
        }).catch((err) => {
            logger.error('Błąd ustawiania aktualnego roku/semestru: %s', err);
            res.send({ type: 'error', message: err.message });
        });
});

module.exports = router;
