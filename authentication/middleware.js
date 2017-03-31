'use strict';
const logger = require('winston');

function authenticationMiddleware () {  
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      logger.debug('Użytkownik zalogowany, dostęp do ' + req.url);
      return next();
    }
    
    logger.debug('Użytkownik niezalogowany, brak dostępu do ' + req.url);
    req.flash('warning', 'By uzyskać dostęp do tej strony należy się zalogować.');
    res.redirect('/login');
  };
}

function authorizeRole(roleId) {
  return function(req, res, next) {
    if (req.user) {
      const userRole = req.user.role;
      if (userRole == roleId) {
        logger.debug('Dostęp do %s dla roli %s', req.url, userRole);
        return next();
      } else {
        logger.debug('Brak dostępu do %s: rola użytkownika: %s, wymagana: %s', 
          req.url, userRole, roleId);
      }
    } else {
        logger.debug('Brak dostępu do %s: req.user nie jest ustawiony', req.url);
    }
    
    req.flash('warning', 'Nie masz uprawnień do podanej strony.');
    res.redirect('/');
  }
}

exports.authenticate = authenticationMiddleware;
exports.authorize = authorizeRole;