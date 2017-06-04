'use strict';

var express = require('express');
var router = express.Router();
var users = require('../models/user');
const logger = require('winston');
const _ = require('lodash');
const connection = require('../database/connection').connection;

function getUsers(query) {
    const ordering = query.orderBy || [['last_name', 'ASC']];
    return users.User.findAll({
        where: query.where,
        attributes: users.publicFields,
        offset: query.offset,
        limit: query.limit,
        order: ordering
    });
}

function currySendUsers(req, res) {
    return (users) => sendUsers(req, res, users);
};

function sendUsers(req, res, users) {
    res.send(users);
};
/* GET users listing. */
router.get('/', function(req, res, next) {
	getUsers(req.query)
        .then(currySendUsers(req, res));
});

module.exports = router;
