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
const getLimitSyntax = '/offset/:offset/limit/:limit';

function getUsersOfRole(roleId, offset, limit) {
    return users.User.findAll({
        where: { role: roleId },
        attributes: users.publicFields,
        offset: offset,
        limit: limit
    });
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

router.get(['/', getLimitSyntax], function(req, res, next) {
    users.User.findAll({ 
        attributes: users.publicFields,
        offset: req.params.offset,
        limit: req.params.limit
    }).then(curryShowUsers(req, res));
});

router.get('/backend', function(req, res, next) {
    logger.info(req.query);
    users.User.findAll({ 
        attributes: users.publicFields,
        offset: req.params.offset,
        limit: req.params.limit
    }).then(currySendUsers(req, res));
});

router.get([getAdmins, getAdmins + getLimitSyntax], function(req, res, next) {
    getUsersOfRole('1', req.params.offset, req.params.limit)
        .then(curryShowUsers(req, res));
});

router.get([getTeachers, getTeachers + getLimitSyntax], function(req, res, next) {
    getUsersOfRole('2', req.params.offset, req.params.limit)
        .then(curryShowUsers(req, res));
});

router.get([getStudents, getStudents + getLimitSyntax], function(req, res, next) {
    getUsersOfRole('3', req.params.offset, req.params.limit)
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
