const connection = require("../database/connection").connection;
const Sequelize = require("sequelize");

const definition = connection.define('subjects', {
  id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nazwa przedmiotu musi zostać uzupełniona.' },
      isAlpha: { msg: 'Nazwa przedmiotu może zawierać tylko litery.', args: ['pl-PL'] }
    }
  }
}, {
  freezeTableName: true,
  underscored: true
});

exports.Subject = definition;