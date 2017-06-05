'use strict';

const connection = require("../database/connection");
const Sequelize = require("sequelize");
const logger = require('winston');
const applicationReasons = require('./application-reasons');
const applicationStatuses = require('./application-statuses');
const scholarshipReasons = require('./scholarship-reasons');
const user = require('./user');
const ApplicationDoesNotExitError = require('./errors/application-does-not-exist');
const IllegalApplicationStatusChangeError = require('./errors/illegal-application-status-change');
const ApplicationContentInvalidError = require('./errors/application-content-invalid');
const moment = require('moment');
const Promise = require('bluebird');
const przedluzeniePdf = require('../pdfs/przedluzenieSesji');
const komisPdf = require('../pdfs/komis');
const stypendiumPdf = require('../pdfs/stypendium');
const warunekPdf = require('../pdfs/warunek');

const definition = connection.connection.define('applications', {
  id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  },
  reason: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isIn: { msg: 'Niepoprawny powód złożenia podania',  args: [applicationReasons.Reasons] }
    }
  },
  body: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Treść podania musi zostać uzupełniona.' },
    }
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isIn: { msg: 'Niepoprawny status podania', args: [applicationStatuses.Statuses] }
    }
  }
}, {
  freezeTableName: true, // Model tableName will be the same as the model name
  underscored: true  // Nazwy automatycznie wygenerowanych pól będą uzywać_podkreśleń zamiast CamelCase'a. Bez tego ręczne selecty itp. się komplikują ;-(
});
const maxRealBodyLength = 2000;

exports.Application = definition;
exports.publicFields = [ 'id', 'reason', 'body', 'status', 'userId' ];
definition.belongsTo(user.User, { foreignKey: 'userId' });
user.User.hasOne(definition, { foreignKey: 'userId' });

function canChangeStatus(application, newStatus) {
  switch (application.status) {
    case applicationStatuses.Oczekujacy:
      return true;
    case applicationStatuses.Rozpatrywany:
      return newStatus != applicationStatuses.Oczekujacy;
    case applicationStatuses.Odrzucony:
    case applicationStatuses.Zaakceptowany:
      return application.status == newStatus;
    default:
      logger.error('Niedozwolony status podania %s: %s', 
        application.id, application.status);
      return false;
  }
}

function extractBody(applicationData) {
  const body = {};
  body.body = applicationData.body;
  if (applicationData.reason === applicationReasons.Przedluzenie) {
    body.until = applicationData.until;
  }
  if (applicationData.reason === applicationReasons.Warunek ||
    applicationData.reason === applicationReasons.EgzaminKomisyjny) {
    body.subject = applicationData.subject;
  }
  if (applicationData.reason === applicationReasons.Stypendium) {
    body.why = applicationData.why;
  }
  return body;
}

function validateBody(applicationBody, reason) {
  if (!applicationBody.body) {
    throw new ApplicationContentInvalidError('Uzasadnienie musi zostać wypełnione.');
  }
  
  if (applicationBody.body.length > maxRealBodyLength) {
    throw new ApplicationContentInvalidError('Uzasadnienie nie może być dłuzsze niż ' + maxRealBodyLength + ' znaków.');
  }
  
  if (reason === applicationReasons.Warunek ||
    reason === applicationReasons.EgzaminKomisyjny) {
    if (!applicationBody.subject) {
      throw new ApplicationContentInvalidError('Przedmiot musi zostać wypełniony.');
    }
    if (applicationBody.subject.length > 255) {
      throw new ApplicationContentInvalidError('Nazwa przedmiotu nie moze być dłuższa niż 255 znaków.');
    }
  }
  
  if (reason === applicationReasons.Przedluzenie) {
    try {
      if (!applicationBody.until) {
        throw new ApplicationContentInvalidError('Data musi zostać wypełniona.');
      }
      
      if (!moment(applicationBody.until).isValid()) {
        throw new ApplicationContentInvalidError('Podana data jest niepoprawna.');
      }
    } catch (err) {
        throw new ApplicationContentInvalidError('Podana data jest niepoprawna.');
    }
  }
  
  if (reason === applicationReasons.Stypendium) {
    if (scholarshipReasons.indexOf(applicationBody.why) === 0) {
        throw new ApplicationContentInvalidError('Rodzaj stypendium jest niepoprawny.');
    }
  }
}

exports.createNewApplication = function (applicationData) {
  const realBody = extractBody(applicationData);
  
  try {
    validateBody(realBody);
  } catch (err) {
    return Promise.reject(err);
  }
  
  if (!applicationData.userId) {
    throw new ApplicationContentInvalidError('Należy uzupełnić użytkownika.');
  }
  
  return definition.create({
    userId: applicationData.userId,
    reason: applicationData.reason,
    body: JSON.stringify(realBody),
    status: applicationStatuses.Oczekujacy
  });
};

exports.changeStatus = function (applicationId, newStatus) {
  return definition.findOne({
    where: { id: applicationId }
  }).then((application) => {
    if (application) {
      if (canChangeStatus(application, newStatus)) {
        application.status = newStatus;
        return application.save().then((_) => application);
      } else {
        throw new IllegalApplicationStatusChangeError('Nie można zmienić statusu na podany.', 
          applicationId, application.status, newStatus);
      }
    } else {
      throw new ApplicationDoesNotExitError('Wskazane podanie nie istnieje.', applicationId);
    }
  });
};

exports.toPdf = function (application, outputPipe) {
  switch (application.reason) {
    case applicationReasons.Stypendium:
      stypendiumPdf.create(application, outputPipe);
      break;
    case applicationReasons.Przedluzenie:
      przedluzeniePdf.create(application, outputPipe);
      break;
    case applicationReasons.EgzaminKomisyjny:
      komisPdf.create(application, outputPipe);
      break;
    case applicationReasons.Warunek:
      warunekPdf.create(application, outputPipe);
      break;
    default:
      throw new ApplicationContentInvalidError('Powód złożenia aplikacji jest nieprawidłowy.');
  }
};

exports.makeReadableApplicationObject = function(application) {
  return {
    id: application.id,
    reason: applicationReasons.getReadableReason(application.reason),
    createdAt: moment(application.created_at).format('DD.MM.YYYY'),
    status: applicationStatuses.getReadableStatus(application.status),
    body: application.body
  };
};