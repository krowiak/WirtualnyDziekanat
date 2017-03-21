var express = require('express');
var router = express.Router();
var passport = require('passport')
const helpers = require('./helpers');


/* GET ekran logowania. */
router.get('/', function(req, res, next) {
  res.render('login', helpers.createLayoutData(req));
});

router.post('/',
  passport.authenticate('local', { successRedirect: '/tajemnice',
                                   failureRedirect: '/login',
                                   failureFlash: true})
);

module.exports = router;