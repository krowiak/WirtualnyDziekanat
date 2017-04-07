'use strict';

const express = require('express');
const router = express.Router();
const Users = require('../models/user');
const logger = require('winston');
const Promise = require('bluebird');
const InvalidPasswordError = require('../models/errors/invalid-password');
const mail = require('../mail/mail').transport;
const s = require('sprintf-js');
const url = require('url');

function handleInvalidOrOutdatedTokens(req, res, token) {
  if (token) {
    return Users.User.findOne({
      where: {
        passwordResetToken: token
      }
    }).then((user) => {
      if (user) {
        const expirationTime = user.passwordResetExpirationDate;
        const currentTime = new Date(Date.now());
        if (expirationTime && expirationTime.getTime() >= currentTime.getTime()) {
          return Promise.resolve(user);
        }
        else {
          logger.info('Token restartowania hasła nieważny. Termin ważności: %s, obecny czas: %s',
            expirationTime, currentTime);
          req.flash('warning', 'Upłynął termin ważności kodu odzyskiwania hasła.');
          res.redirect('/');
          return Promise.resolve(null);
        }
      }
      else {
        logger.info('Brak użytkownika z tokenem restartowania hasła %s', token);
        req.flash('warning', 'Podany kod odzyskiwania hasła jest niepoprawny.');
        res.redirect('/');
        return Promise.resolve(null);
      }
    });
  }
  else {
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
      }
      else {
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
  Users.User.findOne({
    where: {
      email: userMail
    }
  }).then((user) => {
    if (user) {
      return Users.generatePassResetToken(user).then((generated) => {
        logger.info('Wygenerowano token resetowania hasła dla użytkownika o adresie %s', userMail);
        const recoveryAddress = url.format({
          protocol: req.protocol,
          host: req.get('host'),
          pathname: s.sprintf('/password/reset/%s', generated.token)
        });
        logger.info('Adres odzyskiwania hasła: %s', recoveryAddress);
        const message = {
          from: 'wirtualnyadmin@wirtualnydziekanat.com',
          to: userMail,
          subject: 'Wirtualny dziekanat - odzyskiwanie hasła',
          text: s.sprintf('By odzyskać hasło kliknij w ten link (bądź skopiuj go do przeglądarki): %s .',
            recoveryAddress),
          html: s.sprintf('<p>By odzyskać hasło kliknij w ten link (bądź skopiuj go do przeglądarki): <a href="%s">%s</a>.</p>',
            recoveryAddress, recoveryAddress)
        };

        return mail.sendMail(message).then(() => {
          logger.info('Mail z tokenem przywracania hasła został wysłany do uzytkownika %s', userMail);
        });
      }).then(() => {
        req.flash('info', 'Wiadomość e-mail z kodem odzyskiwania hasła została wysłana na podany adres.');
        res.redirect('/');
      }).catch((err) => {
        logger.error('Błąd podczas odzyskiwania hasła.');
        logger.error(err);
        req.flash('error', 'Nie całkiem udało się wysłać maila z kodem odzyskiwania hasła. Spróbuj ponownie później.');
        res.redirect('/');
      });
    }
    else {
      logger.info('Brak użytkownika o podanym mailu: %s', userMail);
      req.flash('warning', 'Nie znaleziono użytkownika o podanym adresie.');
      res.redirect('forgot');
    }
  });
});

module.exports = router;