'use strict';

const connection = require("../database/connection");
const Sequelize = require("sequelize");
const hash = require("password-hash");

const definition = connection.connection.define('user', {
  firstName: {
    type: Sequelize.STRING,
    field: 'first_name',
    allowNull: false
  },
  lastName: {
    type: Sequelize.STRING,
    field: 'last_name',
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  hashedPassword: {
    type: Sequelize.STRING,
    field: 'hashed_password',
    allowNull: false
  },
  locked: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  role: {
    type: Sequelize.STRING,
    allowNull: false
  },
  forcePasswordChange: {
    type: Sequelize.BOOLEAN,
    field: 'force_pass_change',
    allowNull: false
  }
}, {
  freezeTableName: true // Model tableName will be the same as the model name
});

exports.users = [{username:'admin', password:'admin'}]
exports.User = definition;
exports.newUser = function (userData) {
    const password = userData.password;
    const hashedPassword = hash.generate(password);
    
    return definition.create({
       firstName: userData.firstName,
       lastName: userData.lastName,
       email: userData.email,
       locked: false,
       role: userData.role,
       hashedPassword: hashedPassword,
       forcePasswordChange: false
    });
};
exports.login = function (email, password) {
    return definition.find(
      { where: { email: email } } 
    ).then(function(usr) {
        console.log(usr);
        if (hash.verify(password, usr.hashedPassword))
        {
            console.log('---------------------zweryfikowany');
            return usr;
        }
        else
        {
            console.log('--------------------niezweryfikowany');
            console.log(password);
            console.log(usr.hashedPassword);
            throw new Error();
        }
    })
};



// var usr = User.create({
//      firstName: 'John',
//      lastName: 'Hancock'
//   }).then(function() {
//      console.log('dodanooo');
//   }).then(function() {
//      User.findOne().then(function(a) {
//       console.log(a);
//     });
//   });