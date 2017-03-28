const databaza = [
  {id:1, name:'Administrator'}, 
  {id:2, name:'Nauczyciel'},
  {id:3, name:'Student'},
  {id:4, name:'Drugi administrator'},
];
var express = require('express');
var router = express.Router();
var Users = require('../models/user');

/* GET ekran rejestracji. */
router.get('/', function(req, res, next) {
  req.viewData.roles = databaza;
  res.render('registration', req.viewData);
});

router.post('/', function(req, res, next) {
  const pass1 = req.param('password'),
    pass2 = req.param('verify-password');
  
  if (pass1 === pass2) {
    Users.newUser({
      firstName: req.param('firstname'),
      lastName: req.param('lastname'),
      email: req.param('email'),
      password: req.param('password'),
      role: req.param('role')
    }).then(function() {
        res.redirect('/login');
    }).catch(function(err) {  // Czy to na pewno coś łapie sprawdzić
        req.flash('error', 'Błąd rejestracji. Spróbuj ponownie w skończonym czasie.');
        res.redirect('/'); // Prawodpodobnie słaby sposó odświeżania
    });
  } else {
    req.flash('warning', 'Podane hasło nie zgadza się z weryfikowanym hasłem, co za piękne zdanie, mniam.');
    res.redirect('/'); // Prawodpodobnie słaby sposó odświeżania
  }
    //Users.users.push({username:req.param('email'), password:req.param('password')});
    //res.redirect('/login');
});

module.exports = router;