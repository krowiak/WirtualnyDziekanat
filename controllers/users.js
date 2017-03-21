var express = require('express');
var router = express.Router();
var users = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send(users.users);
});

module.exports = router;
