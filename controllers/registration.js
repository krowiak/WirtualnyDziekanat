var express = require('express');
var router = express.Router();
var Users = require('../models/user');

const databaza = [
  {id:1, name:'Administrator'}, 
  {id:2, name:'Nauczyciel'},
  {id:3, name:'Student'},
  {id:4, name:'Drugi administrator'},
];

/* GET ekran rejestracji. */
router.get('/', function(req, res, next) {
  req.viewData.roles = databaza;
  res.render('registration', req.viewData);
});

router.post('/', function(req, res, next) {
    Users.users.push({username:req.param('email'), password:req.param('password')});
    res.redirect('/login');
});

module.exports = router;