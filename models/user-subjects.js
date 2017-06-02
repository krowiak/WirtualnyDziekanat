'use strict';

const Sequelize = require('sequelize');
const connection = require("../database/connection").connection;
const user = require('./user');
const userRoles = require('./user-roles');
const subject = require('./subject');
const SubjectDoesNotExistError = require("./errors/subject-does-not-exist");
const UserDoesNotExistError = require("./errors/user-does-not-exist");
const logger = require('winston');
const CannotAssignRoleToSubjectError = require("./errors/cannot-assign-role-to-subject");

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
user.User.belongsToMany(subject.Subject, {through: thisTableName, foreignKey: 'userId', otherKey: 'subjectId'});
subject.Subject.belongsToMany(user.User, {through: thisTableName, foreignKey: 'subjectId', otherKey: 'userId'});

exports.UserSubjects = definition;

function ensureExistThen(subjectId, userId, then) {
  return subject.Subject.findOne({where: { id: subjectId }})
    .then((subject) => {
      if (subject) {
        return user.User.findOne({ where: {id: userId }})
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

    if (user.role !== userRoles.Student && user.role !== userRoles.Teacher) {
      throw new CannotAssignRoleToSubjectError('Tylko studenci i nauczyciele mogą być przypisywani do przedmiotów.', userId, user.role);
    }
    
    //definition.create({}).then((x) => user.addUserSubjects(x).then((_) => x)).then((y) => subject.addUserSubjects(y).then((_) => y)).then(z => z.save());
    //return user.addSubject(subject, { through: {} });
    
    return definition.findOrCreate({
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