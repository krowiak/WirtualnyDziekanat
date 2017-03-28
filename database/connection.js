const sequelize = require('sequelize'); 

const seq = new sequelize.Sequelize('dziekanat', 'ubuntu', 'admin', {
  host: 'localhost',
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

exports.connection = seq;