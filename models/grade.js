'use strict';

const Sequelize = require('sequelize');
const connection = require("../database/connection").connection;
const user = require('./user');
const userRoles = require('./user-roles');
const subject = require('./subject');
const GradeTargetInvalidError = require('./errors/grade-target-invalid');
const GradeAlreadyExistsError = require('./errors/grade-already-exists');

const gradeDef = connection.define('grade', {
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
  },
  
}, {
    freezeTableName: true,
    underscored: true
  });
gradeDef.belongsTo(user.User, {foreignKey: 'userId'});
user.User.hasMany(gradeDef, {foreignKey: 'userId'});
gradeDef.belongsTo(subject.Subject, {foreignKey: 'subjectId'});
subject.Subject.hasMany(gradeDef, {foreignKey: 'subjectId'});

exports.Grade = gradeDef;
exports.publicFields = [ 'id', 'attempt', 'grade', 'userId', 'subjectId' ];

exports.extractPublicFields = function (grade) {
  return {
    id: grade.id,
    attempt: grade.attempt,
    grade: grade.grade,
    userId: grade.userId,
    subjectId: grade.subjectId
  };
}


function getUserAndSubject(userId, subjectId) {
  return user.User.findOne({ 
    where: {id: userId },
    include: [{
        model: subject.Subject,
        where: { id: subjectId }
    }]
  }).then((user) => {
    if (user) {
      return user.getSubjects({ where: { id: subjectId }})
        .then((subject => [user, subject]));
    } else {
      throw new GradeTargetInvalidError('Podany użytkownik nie jest przypisany do podanego przedmiotu.',
        userId, subjectId);
    }
  });
}

exports.addGrade = function (userId, subjectId, grade, attempt) {
  return getUserAndSubject(userId, subjectId).spread((user, subject) => {
    if (user.role !== userRoles.Student) {
      throw new GradeTargetInvalidError('Tylko studenci mogą otrzymywać oceny z przedmiotów.',
        userId, subjectId);
    }
    
    return gradeDef.findOrCreate({
      where: { 
        userId: userId,
        subjectId: subjectId,
        attempt: attempt
      },
      defaults: {
        grade: grade
      }
    }).spread((grade, created) => {
      if (!created) {
        throw new GradeAlreadyExistsError('Podany uzytkownik otrzymał już ocenę z tego przedmiotu w danym terminie.',
          userId, subjectId, attempt);
      }
      
      return grade;
    });
  });
};