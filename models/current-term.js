'use strict';

const Sequelize = require('sequelize');
const connection = require("../database/connection").connection;

const currentTerm = connection.define('currentTerm', {
  id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
  },
  year: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: { args: 1993, msg: 'Lata sprzed 1993 nie są dozwolone' },
      max: { args: 2117, msg: 'Lata powyżej 2117 nie są dozwolone' }
    }
  },
  term: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: { args: 1, msg: 'Semestr może być tylko letni lub zimowy' },  // semestr zimowy
      max: { args: 2, msg: 'Semestr może być tylko letni lub zimowy' }  // semestr letni
    }
  }
}, {
    freezeTableName: true,
    underscored: true
  });

exports.currentTerm = currentTerm;
exports.publicFields = [ 'id', 'year', 'term' ];

exports.setCurrent = function (year, term) {
  return exports.getCurrent().then((current) => {
    if (current) {
      current.year = year;
      current.term = term;
      return current.save().then((_) => current);
    } else {
      return currentTerm.create({ year: year, term: term });
    }
  });
};

exports.getCurrent = function () {
  // Zawsze powinien być tylko jeden aktualny rok/semestr
  return currentTerm.findOne();
};