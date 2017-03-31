'use strict';

const Sequelize = require('sequelize');
const connection = require("../database/connection").connection;
const user = require('./user').User;
const subject = require('./subject').Subject;
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
user.belongsToMany(subject, {through: thisTableName, otherKey: 'userId'});
subject.belongsToMany(user, {through: thisTableName, otherKey: 'subjectId'});

exports.UserSubjects = definition;