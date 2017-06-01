'use strict';

const express = require('express');
const router = express.Router();
const users = require('../models/user');
const logger = require('winston');
const _ = require('lodash');
const connection = require('../database/connection').connection;

const getStudents = '/students';
const getTeachers = '/teachers';
const getAdmins = '/admins';

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

function getUsersOfRole(roleId, query) {
    const where = query.where || {};
    where.role = roleId;
    return getUsers(query);
}

function getUsersByIds(ids) {
    return users.User.findAll({
        where: { 
            id: {
                $in: ids
            }
        }
    });
}

function showUsers(req, res, users) {
    req.viewData.users = users;
    res.render('user-list', req.viewData);
};

function curryShowUsers(req, res, users) {
    return (users) => showUsers(req, res, users);
};

function sendUsers(req, res, users) {
    res.send(users);
};

function currySendUsers(req, res) {
    return (users) => sendUsers(req, res, users);
};

router.get('/', function(req, res, next) {
    getUsers(req.query)
        .then(curryShowUsers(req, res));
});

router.get('/backend', function(req, res, next) {
    getUsers(req.query)
        .then(currySendUsers(req, res));
});

router.get(getAdmins, function(req, res, next) {
    getUsersOfRole('1', req.query)
        .then(curryShowUsers(req, res));
});

router.get(getTeachers, function(req, res, next) {
    getUsersOfRole('2', req.query)
        .then(curryShowUsers(req, res));
});

router.get(getStudents, function(req, res, next) {
    getUsersOfRole('3', req.query)
        .then(curryShowUsers(req, res));
});

router.post('/changeUsers', function(req, res, next) {
    const changes = req.body.changes;
    if (changes) {
        const changedObjIds = changes.map((obj) => obj.id);
        logger.debug('Id zmienionych obiektów: %s', changedObjIds);
        connection.transaction(function(t) {
            return getUsersByIds(changedObjIds).then((users) => {
                const usersByIds = _.keyBy(users, 'id');
                for (let changedUser of changes) {
                    for (let changedFieldKey of Object.keys(changedUser)) {
                        if (changedFieldKey !== 'id') {
                            usersByIds[changedUser.id][changedFieldKey] = changedUser[changedFieldKey];
                            logger.info('Id %s - %s: %s', changedUser.id, changedFieldKey, changedUser[changedFieldKey]);
                        }
                    }
                    usersByIds[changedUser.id].save();
                }
            });
        }).then(() => {
            res.send({ type: 'info', message: 'Zmiany zostały zapisane.' });
        });
    } else {
        logger.debug('Brak zmian użytkowników.');
        res.send({ type: 'warning', message: 'Brak zmian do wprowadzenia.' });
    }
});

module.exports = router;
