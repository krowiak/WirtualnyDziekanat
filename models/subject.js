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
  },
  // pierwszy rok z pary, tzn. "2016/2017" -> 2016
  year: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: { args: 1993, msg: 'Lata sprzed 1993 nie są dozwolone' },  // nic sprzed moich urodzin nikogo i tak nie interesuje
      max: { args: 2117, msg: 'Lata powyżej 2117 nie są dozwolone' }  // sprzedajemy licencje na maks. 100 lat
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

exports.Subject = definition;
exports.publicFields = [ 'id', 'name', 'year', 'term' ];

exports.createNewSubject = function(subjectData) {
  const trimmedName = subjectData.name.trim();
  return definition.findOrCreate({
    where: { 
      name: trimmedName, 
      year: subjectData.year, 
      term: subjectData.term 
    } 
  }).spread(function(subject, created) {
    if (!created) {
      throw new SubjectAlreadyExistsError('Przedmiot o podanej nazwie już istnieje dla podanego semestru.', subject);
    }
    
    return subject;
  });
};