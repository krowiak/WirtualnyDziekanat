'use strict';

const connection = require("../database/connection");
const Sequelize = require("sequelize");
const hash = require("password-hash");
const Promise = require("bluebird");
const passwordValidation = require("../authentication/password-validation");
const UserAlreadyExistsError = require("./errors/user-already-exists");
const LoginFailedError = require("./errors/login-failed");
const InvalidPasswordError = require("./errors/invalid-password");
const AccountLockedError = require("./errors/account-locked");
const crypto = require('crypto');
const logger = require('winston');

const definition = connection.connection.define('users', {
  id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  },
  firstName: {
    type: Sequelize.STRING,
    field: 'first_name',
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Imię musi zostać uzupełnione.' },
      isAlpha: { msg: 'Imię może zawierać tylko litery.', args: ['pl-PL'] }  // To chyba nie działa dla chińskich znaczków itp, ale cooo taaaam
    }
  },
  lastName: {
    type: Sequelize.STRING,
    field: 'last_name',
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nazwisko musi zostać uzupełnione.' },
      isAlpha: { msg: 'Nazwisko może zawierać tylko litery.', args: ['pl-PL'] }
    }
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Podany adres e-mail nie jest prawidłowy.' },
      notEmpty: { msg: 'Adres e-mail nie może być pusty.' }
    }
  },
  hashedPassword: {
    type: Sequelize.STRING,
    field: 'hashed_password',
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  locked: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  role: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  forcePasswordChange: {
    type: Sequelize.BOOLEAN,
    field: 'force_pass_change',
    allowNull: false
  },
  passwordResetToken: {
    type: Sequelize.STRING(40),
    field: 'password_reset_token',
    allowNull: true
  },
  passwordResetExpirationDate: {
    type: Sequelize.DATE,
    field: 'password_reset_expiration_date',
    allowNull: true
  }
}, {
  freezeTableName: true, // Model tableName will be the same as the model name
  underscored: true  // Nazwy automatycznie wygenerowanych pól będą uzywać_podkreśleń zamiast CamelCase'a. Bez tego ręczne selecty itp. się komplikują ;-(
});

exports.User = definition;
exports.publicFields = [ 'id', 'firstName', 'lastName', 'email', 'locked', 'role', 'forcePasswordChange' ];
exports.createNewUser = function (userData) {
    const password = userData.password;
    const passValidation = passwordValidation.validatePassword(password);
    const hashedPassword = hash.generate(password);
    
    if (!passValidation.success) {
      return Promise.reject(new InvalidPasswordError(passValidation.message));
    }
    
    return definition.findOrCreate({
      where: {email: userData.email}, 
      defaults: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        locked: false,
        role: userData.role,
        hashedPassword: hashedPassword,
        forcePasswordChange: false
    }}).spread(function(user, created) {
      if (!created) {
        throw new UserAlreadyExistsError('Użytkownik o podanej nazwie już istnieje.', user);
      }
      
      return user;
    });
};
exports.login = function (email, password) {
    return definition.find(
      { where: { email: email } } 
    ).then(function(usr) {
        if (usr)
        {
          if (hash.verify(password, usr.hashedPassword)) {
            if (usr.locked) {
              throw new AccountLockedError();
            } else {
              return usr;
            }
          } else {
            throw new LoginFailedError('Złe hasło użytkownika.');
          }
        }
        else
        {
          throw new LoginFailedError('Użytkownik o podanej nazwie nie istnieje.');
        }
    })
};
exports.generatePassResetToken = function (user) {
  const resetTokenLengthInBytes = 20;
  const oneHourInMs = 60*60*1000;
  const randomBytes = Promise.promisify(crypto.randomBytes);
  return randomBytes(resetTokenLengthInBytes).then((bytes) => {
    user.passwordResetToken = bytes.toString('hex');
    user.passwordResetExpirationDate = new Date(Date.now() + oneHourInMs);
    return user.save().then(() => {
      Promise.resolve({ token: user.passwordResetToken,
        expiration: user.passwordResetExpirationDate });
    });
  }).catch((err) => {
      logger.warn('Błąd podczas generowania tokenu resetowania hasła: %s', err);
      throw err;
  });
}
exports.changePassword = function (user, newPassword) {
    const passValidation = passwordValidation.validatePassword(newPassword);
    if (passValidation.success) {
      logger.info('Udana zmiana hasła.');
      const hashedPassword = hash.generate(newPassword);
      user.hashedPassword = hashedPassword;
      user.passwordResetToken = null;
      user.passwordResetExpirationDate = null;
      user.forcePasswordChange = false;
      return user.save();
    } else {
      logger.warn('Hasło niepoprawne: %s', passValidation);
      return Promise.reject(new InvalidPasswordError(passValidation.message));
    }
}