const sequelize = require('sequelize'); 
const loggerConfig = require('../logging/logging-config');

const seq = new sequelize.Sequelize('dziekanat', 'postgres', '1qaz2wsx', {
  host: 'localhost',
  dialect: 'postgres',
  logging: loggerConfig.logOrmStuff,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

exports.connection = seq;