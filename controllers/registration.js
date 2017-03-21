var express = require('express');
var router = express.Router();
var Users = require('../models/user');


/* GET ekran logowania. */
router.get('/', function(req, res, next) {
  res.render('registration');
});

router.post('/', function(req, res, next) {
    Users.users.push({username:req.param('email'), password:req.param('password')});
    res.send(Users.users);
});

module.exports = router;