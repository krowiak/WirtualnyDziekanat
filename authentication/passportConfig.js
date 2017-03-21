const users = require('../models/user');
const _ = require('underscore');

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
    return user ? done(null, user) : done(null, false);
};

exports.serialize = serializeUser;
exports.deserialize = deserializeUser;
exports.checkPassword = checkPassword;