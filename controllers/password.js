'use strict';

const express = require('express');
const router = express.Router();
const Users = require('../models/user');
const logger = require('winston');
const Promise = require('bluebird');
const InvalidPasswordError = require('../models/errors/invalid-password');

function handleInvalidOrOutdatedTokens(req, res, token) {
  if (token) {
    return Users.User.findOne({ where: { passwordResetToken: token }}).then((user) => {
      if (user) {
        const expirationTime = user.passwordResetExpirationDate;
        const currentTime = new Date(Date.now());
        if (expirationTime && expirationTime.getTime() >= currentTime.getTime()) {
          return Promise.resolve(user);
        } else {
          logger.info('Token restartowania hasła nieważny. Termin ważności: %s, obecny czas: %s', 
            expirationTime, currentTime);
          req.flash('warning', 'Upłynął termin ważności kodu odzyskiwania hasła.');
          res.redirect('/');
          return Promise.resolve(null);
        }
      } else {
        logger.info('Brak użytkownika z tokenem restartowania hasła %s', token);
        req.flash('warning', 'Podany kod odzyskiwania hasła jest niepoprawny.');
        res.redirect('/');
        return Promise.resolve(null);
      }
    });
  } else {
    logger.info('Podano pusty token restartowania hasła');
    req.flash('warning', 'Podany kod odzyskiwania hasła jest niepoprawny.');
    res.redirect('/');
    return Promise.resolve(null);
  }
}

router.get('/reset/:token', function(req, res, next) {
  const token = req.params.token;
  handleInvalidOrOutdatedTokens(req, res, token).then((user) => {
    if (user) {
      logger.info('Token restartowania hasła jest poprawny');
      req.viewData.token = token;
      res.render('password-reset', req.viewData);
    }
  });
});

router.post('/reset', function(req, res, next) {
  const token = req.body.token;
  handleInvalidOrOutdatedTokens(req, res, token).then((user) => {
    if (user) {
      logger.info('Token restartowania hasła jest poprawny');
      const newPassword = req.body.password,
        verifyPasword = req.body['verify-password'];
      if (newPassword == verifyPasword) {
        logger.info('Podane hasło zgadza się z potwierdzeniem hasła');
        Users.changePassword(user, newPassword).then(() => {
          req.logOut();
          req.flash('success', 'Twoje hasło zostało zmienione.');
          logger.info('Hasło zmienione, przekierowanie na login');
          res.redirect('/login');
        }).catch(InvalidPasswordError, (err) => {
          logger.warn('Hasło niepoprawne: %j', err);
          req.flash('warning', err.message);
          res.redirect('/');
        });
      } else {
        logger.warn('Hasło i jego potwierdzenie nie zgadzają się');
        req.flash('warning', 'Podane hasła nie zgadzają się ani trochę.');
        res.redirect('/');
      }
    }
  });
});

router.get('/forgot', function(req, res, next) {
  res.render('forgot-password', req.viewData);
});

router.post('/forgot', function(req, res, next) {
    const userMail = req.body.email;
    Users.User.findOne({ where: { email: userMail } }).then((user) => {
        if (user) {
            return Users.generatePassResetToken(user).then((generated) => {
                logger.info('Wygenerowano token resetowania hasła dla użytkownika o adresie %s', userMail);
                logger.info('BONUS póki nic nie jest rozsyłane: %j', generated);
                // Jakieś wysyłanie maili
            });
        } else {
            logger.info('Brak użytkownika o podanym mailu: %s', userMail);
            // Jakieś coś że nie ma takiego maila.
        }
    });
});

module.exports = router;