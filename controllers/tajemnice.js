var express = require('express');
var auth = require('../authentication/middleware')
var router = express.Router();
const helpers = require('./helpers');

/* GET strona tylko dla zalogowanych. */
router.get('/', auth.authenticate(), function(req, res, next) {
    res.render('tajemnice', helpers.createLayoutData(req));
});

module.exports = router;