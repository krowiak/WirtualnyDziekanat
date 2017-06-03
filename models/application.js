'use strict';

const connection = require("../database/connection");
const Sequelize = require("sequelize");
const logger = require('winston');
const applicationReasons = require('./application-reasons');
const applicationStatuses = require('./application-statuses');
const user = require('./user');
const ApplicationDoesNotExitError = require('./errors/application-does-not-exist');
const IllegalApplicationStatusChangeError = require('./errors/illegal-application-status-change');

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

exports.createNewApplication = function (applicationData) {
  logger.info(applicationData);
  logger.info(applicationReasons.Reasons);
  logger.info(applicationReasons.Reasons[2] == applicationData.reason);
  
  return definition.create({
    userId: applicationData.userId,
    reason: applicationData.reason,
    body: applicationData.body,
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