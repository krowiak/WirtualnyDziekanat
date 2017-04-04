'use strict';

const express = require('express');
const router = express.Router();
const users = require('../models/user');
const logger = require('winston');
const _ = require('lodash');
const connection = require('../database/connection').connection;

function getUsersOfRole(roleId) {
    return users.User.findAll({
        where: { role: roleId },
        attributes: users.publicFields
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

router.get('/students', function(req, res, next) {
    getUsersOfRole('3').then(function(users) {
        req.viewData.users = users;
        res.render('user-list', req.viewData);
    });
});

router.get('/teachers', function(req, res, next) {
    getUsersOfRole('2').then(function(users) {
        req.viewData.users = users;
        res.render('user-list', req.viewData);
    });
});

router.post('/changeLocked', function(req, res, next) {
    const changes = req.body.changes;
    console.log(req.body);
    if (changes) {
        const changedObjIds = changes.map((obj) => obj.id);
        logger.debug('Id zmienionych obiektów: %s', changedObjIds);
        connection.transaction(function(t) {
            return getUsersByIds(changedObjIds).then((users) => {
                const usersByIds = _.keyBy(users, 'id');
                for (let changedUser of changes) {
                    usersByIds[changedUser.id].locked = changedUser.locked;
                    usersByIds[changedUser.id].save();
                }
            })
        }).then(() => {
            req.flash('info', 'Zmiany zostały zapisane.');
            res.send('/');  // Źle
        });
    } else {
        logger.debug('Brak zmian blokowania użytkowników.');
        req.flash('info', 'Brak zmian do wprowadzenia.');
        res.send('back');  // Nadal źle
    }
});

module.exports = router;
