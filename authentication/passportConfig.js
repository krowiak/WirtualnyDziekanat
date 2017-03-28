const users = require('../models/user');
const _ = require('lodash');
const s = require('sprintf-js');
const hash = require("password-hash");

const loggedInMsgFormat = 'Zalogowano jako %(email)s.';
const loginFailedMsg = 'Niepoprawna nazwa użytkownika lub hasło.';

const serializeUser = function(user, done) {
  done(null, user);
};

const deserializeUser = function(user, done) {
  done(null, user);
};

// B. bezpiecznie
const checkPassword = function(username, password, done) {
  users.login(username, password).then(function(usr) {
      console.log('----------------------------then');
      done(null, usr, /*{ message: s.sprintf(loggedInMsgFormat, usr) }*/ {message: 'YAY'});
  }).catch(function(err) {
      console.log('----------------------------catch');
      console.log(err);
      done(null, false, { message: loginFailedMsg });
  });
};

exports.serialize = serializeUser;
exports.deserialize = deserializeUser;
exports.checkPassword = checkPassword;