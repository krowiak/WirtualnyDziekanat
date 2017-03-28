'use strict';

const express = require('express');
const router = express.Router();
const Users = require('../models/user');
const UserRoles = require("../models/user-roles");
const UserAlreadyExistsError = require("../models/errors/user-already-exists");
const InvalidPasswordError = require("../models/errors/invalid-password");
const SequelizeValidationError = require("sequelize").ValidationError;
const s = require("sprintf-js");
const _ = require("lodash");

/* GET ekran rejestracji. */
router.get('/', function(req, res, next) {
  const rolesForView = _(UserRoles.Roles)
    .toPairs()
    .map((pair) => { return { id: pair[0], name: pair[1] }; })
    .value();
  
  req.viewData.roles = rolesForView;
  res.render('registration', req.viewData);
});

router.post('/', function(req, res, next) {
  const pass1 = req.body.password,
    pass2 = req.body['verify-password'];
  
  if (pass1 === pass2) {
    Users.createNewUser({
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role
    }).then(function(user) {
        res.redirect('/login');
    }).catch(UserAlreadyExistsError, function(err) {
        req.flash('warning', 'Użytkownik o podanym adresie e-mail już istnieje.');
        res.redirect('back');
    }).catch(InvalidPasswordError, function(err) {
        req.flash('warning', err.message);
        res.redirect('back');
    }).catch(SequelizeValidationError, function(err) {
      const errors = err.errors;
      if (errors.length === 1) {
        req.flash('warning', errors[0].message);
      } else {
        req.flash('warning', s.sprintf('%i błędów, w tym: "%s"', errors.length, 
        errors[0].message + errors[1].message));
      }
        res.redirect('back');
    }).catch(function(err) {
        req.flash('error', 'Błąd rejestracji. Spróbuj ponownie w skończonym czasie.');
        res.redirect('back');
    });
  } else {
    req.flash('warning', 'Podane hasło nie zgadza się z weryfikowanym hasłem.');
    res.redirect('back');
  }
});

module.exports = router;