'use strict';
const logger = require('winston');

function authenticationMiddleware () {  
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      logger.debug('Użytkownik zalogowany, dostęp do ' + req.url);
      return next();
    }
    logger.debug('Użytkownik niezalogowany, brak dostępu do ' + req.url);
    res.redirect('/login');
  };
}

exports.authenticate = authenticationMiddleware;