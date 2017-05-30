const connection = require("../database/connection").connection;
const Sequelize = require("sequelize");
const SubjectAlreadyExistsError = require("./errors/subject-already-exists");

// Trochę chyba ubogi model
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
      is: { msg: 'Nazwa przedmiotu może zawierać tylko litery i spacje.', args: ['^[a-zA-ZżźćńółęąśŻŹĆĄŚĘŁÓŃ ]+$'] }
      //isAlpha: { msg: 'Nazwa przedmiotu może zawierać tylko litery.', args: ['pl-PL'] }
    }
  }
}, {
  freezeTableName: true,
  underscored: true
});

exports.Subject = definition;
exports.publicFields = [ 'id', 'name' ];

exports.createNewSubject = function(name) {
  const trimmedName = name.trim();
  return definition.findOrCreate({
    where: { name: trimmedName }, 
  }).spread(function(subject, created) {
    if (!created) {
      throw new SubjectAlreadyExistsError('Użytkownik o podanej nazwie już istnieje.', subject);
    }
    
    return subject;
  });
};