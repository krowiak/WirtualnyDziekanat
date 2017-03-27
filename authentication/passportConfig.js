const users = require('../models/user');
const _ = require('underscore');
const s = require('sprintf-js');

const loggedInMsgFormat = 'Zalogowano jako %(username)s.';
const loginFailedMsg = 'Niepoprawna nazwa użytkownika lub hasło.';

const serializeUser = function(user, done) {
  done(null, user);
};

const deserializeUser = function(user, done) {
  done(null, user);
};

// B. bezpiecznie
const checkPassword = function(username, password, done) {
    const user = _.findWhere(users.users, 
        {username:username, password:password});
    return user ? 
      done(null, user, { message: s.sprintf(loggedInMsgFormat, user) }) :
      done(null, false, { message: loginFailedMsg });
};

exports.serialize = serializeUser;
exports.deserialize = deserializeUser;
exports.checkPassword = checkPassword;