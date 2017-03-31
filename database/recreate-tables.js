const connection = require('./connection').connection;

// Require'y poniżej konieczne, żeby modele zostały zdefiniowane przed ich utworzeniem
const users = require("../models/user");
const subjects = require("../models/subject");
const userSubjects = require("../models/user-subjects");
const grades = require("../models/grade");

connection.drop();
connection.sync({force: true});