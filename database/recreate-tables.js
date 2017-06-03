const connection = require('./connection').connection;

// Require'y poniżej konieczne, żeby modele zostały zdefiniowane przed ich utworzeniem
const users = require("../models/user");
const subjects = require("../models/subject");
const userSubjects = require("../models/user-subjects");
const grades = require("../models/grade");
const message = require("../models/message");
const application = require("../models/application");

connection.drop();
connection.sync({force: true})
    .then(() => users.createNewUser({
        password: "admin",
        email: "admin@us.pl",
        firstName: "Sknerus",
        lastName: "McKwacz",
        role: "1"
    })).then(() => users.createNewUser({
        password: "naucz",
        email: "naucz@us.pl",
        firstName: "Ciasteczkowy",
        lastName: "Potwór",
        role: "2"
    })).then(() => users.createNewUser({
        password: "stude",
        email: "stude@us.pl",
        firstName: "Miku",
        lastName: "Hatsune",
        role: "3"
    })).then(() => subjects.createNewSubject({
        name: "Projekt Zespołowy", 
        year: 2016, 
        term: 2 
    })).then(() => userSubjects.add(1, 2))
    .then(() => userSubjects.add(1, 3));