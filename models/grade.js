'use strict';

const Sequelize = require('sequelize');
const connection = require("../database/connection").connection;
const userSubjects = require('./user-subjects').UserSubjects;

const grade = connection.define('grade', {
  id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
  },
  attempt: {  // Nie miałem pomysłu, jak przetłumaczyć "termin"...
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
          min: 1,
          max: 2 // "I lub II termin"
      }
  },
  grade: {
      type: Sequelize.DECIMAL(2,1),
      allowNull: false,
      validate: {
          min: 2,
          max: 5
      }
  }
}, {
    freezeTableName: true,
    underscored: true
  });
grade.belongsTo(userSubjects, {foreignKey: 'user_subject_id'});

exports.Grade = grade;