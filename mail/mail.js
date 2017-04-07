'use strict';

const nodemailer = require('nodemailer');
const logger = require('winston');
const sendgridApiKey = function() {
  try {
    return require('../sekrety/sekrety').apiKey;
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      logger.error('Brak pliku z sekretami zawierającego klucz API SendGrida! ' + 
      'Maile nie będą działać! O nie! ' +
      'W <folder-aplikacji>/sekrety powinien znajdować się plik sekrety.js, a w nim ' +
      'exports.apiKey = \'<klucz, który przy odrobinie szczęścia pamiętałem wam wysłać>\';".' +
      'Lepsze propozycje rozwiązania problemu mile widziane.');
      return undefined;
    } else {
      throw err;
    }
  }
}();
const smptTransport = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: sendgridApiKey
  },
  connectionTimeout: 2000 //ms
});

exports.transport = smptTransport;