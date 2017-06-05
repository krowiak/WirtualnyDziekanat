'use strict';

const Sequelize = require('sequelize');
const connection = require("../database/connection").connection;
const user = require('./user');
const userRoles = require('./user-roles');
const subject = require('./subject');
const GradeTargetInvalidError = require('./errors/grade-target-invalid');
const GradeAlreadyExistsError = require('./errors/grade-already-exists');
const GradeDoesNotExistError = require('./errors/grade-does-not-exist');
const Promise = require('bluebird');

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
          min: {args:1, msg:'Termin nie moze być wcześniejszy niż pierwszy'},
          max: {args:2, msg:'Termin nie moze być późniejszy niż drugi'} // "I lub II termin"
      }
  },
  grade: {
      type: Sequelize.DECIMAL(2,1),
      allowNull: false,
      validate: {
          min: {args:2, msg: 'Ocena nie może być niższa niż 2.0'},
          max: {args:5, msg: 'Ocena nie może być wyższa niż 5.0'}
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
};


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

exports.updateGrade = function (userId, subjectId, attempt, newGrade) {
  return gradeDef.findOne({
    where: {
      userId: userId,
      subjectId: subjectId,
      attempt: attempt
    }
  }).then((grade) => {
    if (grade) {
      grade.grade = newGrade;
      return grade.save();
    } else {
      throw new GradeDoesNotExistError('Wskazana ocena nie istnieje.', 
        userId, subjectId, attempt);
    }
  });
};

exports.addOrUpdateGrade = function (userId, subjectId, newGrade, attempt) {
  return getUserAndSubject(userId, subjectId).spread((user, subject) => {
    if (user.role !== userRoles.Student) {
      throw new GradeTargetInvalidError('Tylko studenci mogą otrzymywać oceny z przedmiotów.',
        userId, subjectId);
    }
    
    let startState;
    
    if (attempt == 1) {
      startState = Promise.resolve(null);
    } else {
      startState = gradeDef.findOne({
        where: { 
          userId: userId,
          subjectId: subjectId,
          attempt: 1
        }
      }).then((firstAttempt) => {
        if (firstAttempt) {
          return firstAttempt;
        }
        
        throw new GradeTargetInvalidError('Najpierw należy wpisać ocenę za pierwszy termin.',
          userId, subjectId);
      });
    }
    
    return startState.then((_) => {
      return gradeDef.findOrCreate({
          where: { 
            userId: userId,
            subjectId: subjectId,
            attempt: attempt
          },
          defaults: {
            grade: newGrade
          }
        }).spread((grade, created) => {
          if (!created) {
            grade.grade = newGrade;
            return grade.save().then((_) => grade);
          }
          
          return grade;
      });
    });
  });
}