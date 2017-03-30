const users = require('../models/user');
const _ = require('lodash');
const s = require('sprintf-js');
const LoginFailedError = require("../models/errors/login-failed");
const logger = require('winston');

const loggedInMsgFormat = 'Zalogowano jako %s.';
const loginFailedMsg = 'Niepoprawna nazwa użytkownika lub hasło.';
const unknownErrorMsg = 'Nie udało się zalogować. Spróbuj ponownie za jakiś czas.';

const serializeUser = function(user, done) {
  done(null, user);
};

const deserializeUser = function(user, done) {
  done(null, user);
};

// B. bezpiecznie
const checkPassword = function(username, password, done) {
  users.login(username, password).then(function(usr) {
    done(null, usr, { message: s.sprintf(loggedInMsgFormat, usr.email) });
  }).catch(LoginFailedError, function(err) {
    logger.debug('Sprawdzanie hasła nieudane: %s', err.message);
    done(null, false, { message: loginFailedMsg });
  }).catch(function(err) {
    logger.error('Błąd sprawdzania hasła: %s' + err);
    done(null, false, { message: unknownErrorMsg });
  });
};

exports.serialize = serializeUser;
exports.deserialize = deserializeUser;
exports.checkPassword = checkPassword;