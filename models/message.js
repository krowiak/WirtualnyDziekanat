'use strict';

const connection = require("../database/connection");
const Sequelize = require("sequelize");
const Promise = require("bluebird");
const logger = require('winston');
const user = require('./user');

const definition = connection.connection.define('messages', {
  id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Wiadomość nie może być pusta.' }
    }
  },
  read: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
}, {
  freezeTableName: true, // Model tableName will be the same as the model name
  underscored: true  // Nazwy automatycznie wygenerowanych pól będą uzywać_podkreśleń zamiast CamelCase'a. Bez tego ręczne selecty itp. się komplikują ;-(
});

exports.Message = definition;
exports.publicFields = [ 'id', 'content', 'read', 'created_at' ];
definition.belongsTo(user.User, { foreignKey: 'from', as: 'messageFrom' });
definition.belongsTo(user.User, { foreignKey: 'to', as: 'messageTo' });
user.User.hasMany(definition, { foreignKey: 'from', as: 'messageFrom' });
user.User.hasMany(definition, { foreignKey: 'to', as: 'messageTo' });

exports.send = function (idFrom, idTo, content) {
  return definition.create({
    from: idFrom,
    to: idTo,
    content: content,
    read: false
  });
};

exports.getMessageByUser = function(idUser){
    return definition.findAll({
      include: [{
        model: user.User,
        where: { id: idUser },
        attributes: user.publicFields
      }],
      attributes: exports.publicFields
    }
    );

};

