'use strict';

const Sequelize = require('sequelize');
const connection = require("../database/connection").connection;
const user = require('./user');
const subject = require('./subject');
const SubjectDoesNotExistError = require("./errors/subject-does-not-exist");
const UserDoesNotExistError = require("./errors/user-does-not-exist");
const logger = require('winston');

const thisTableName = 'user_subjects';

const definition = connection.define(thisTableName, {
  id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
  }}, {
    freezeTableName: true,
    underscored: true
  });
user.User.belongsToMany(subject.Subject, {through: thisTableName, otherKey: 'userId'});
subject.Subject.belongsToMany(user.User, {through: thisTableName, otherKey: 'subjectId'});

exports.UserSubjects = definition;

function ensureExistThen(subjectId, userId, then) {
  return subject.Subject.findOne({where: { id: subjectId }})
    .then((subject) => {
      if (subject) {
        user.User.findOne({ where: {id: userId }})
          .then((user) => {
            if (user) {
              return then(subject, user);
            } else {
              throw new UserDoesNotExistError('Użytkownik o podanym ID nie istnieje.', userId);
            }
          });
      } else {
        throw new SubjectDoesNotExistError('Przedmiot o podanym ID nie istnieje.', subjectId);
      }
    });
}

exports.add = function (subjectId, userId) {
  return ensureExistThen(subjectId, userId, (subject, user) => {
    definition.findOrCreate({
      where: {
        userId: userId,
        subjectId: subjectId
      }
    }).spread((association, created) => {
      return {created: created, association: association};
    });
  });
};

exports.remove = function (subjectId, userId) {
  return ensureExistThen(subjectId, userId, (subject, user) => {
    return user.removeSubject(subject)
      .then(() => logger.info('Użytkownik usunięty z przedmiotu.'));
  });
};