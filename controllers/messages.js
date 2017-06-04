'use strict';

const express = require('express');
const router = express.Router();
const message = require('../models/message');

// getMessageByUser
router.get('/:userId', function(req, res, next) {

    message.getMessageByUser(req.params.userId).then( (messages) => {
        res.end( JSON.stringify(messages));
    });

});

//sendMessage
router.post('/send', function(req,res) {

    message.send(req.body.fromId,req.body.toId,req.body.content).then( (response) => {
        res.end( JSON.stringify(response));
    });

    }
);

router.get('/', function(req, res, next) {

    res.render('messages',req.viewData);

});

module.exports = router;