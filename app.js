'use strict';

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passportConfig = require('./authentication/passportConfig');
const auth = require('./authentication/middleware');
const flash = require('express-flash');
const helpers = require('./controllers/helpers');
const logger = require('winston');
const loggerConfig = require('./logging/logging-config');
const index = require('./controllers/index');
const users = require('./controllers/users');
const login = require('./controllers/login');
const logout = require('./controllers/logout');
const tajemnice = require('./controllers/tajemnice');
const registration = require('./controllers/registration');
const userLists = require('./controllers/user-list');
const password = require('./controllers/password');
const subjectLists = require('./controllers/subject-list');
const subjectListsTeacher = require('./controllers/subject-list-teacher');
const subjectListsStudent = require('./controllers/subject-list-student');


const app = express();

loggerConfig.initialize();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon-small.ico')));
app.use(morgan('combined', { stream: { write: loggerConfig.logHttpRequest }}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Logowanie i sesje
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session');
app.use(session({
  secret: 'straszliwy',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(passportConfig.serialize);
passport.deserializeUser(passportConfig.deserialize);
passport.use(new LocalStrategy(passportConfig.checkPassword));

// Dodaje obiekt danych widoku wykorzystywany przez layout.pug i potencjalnie inne pugi
app.use(function(req, res, next) {
    req.viewData = helpers.createCommonViewData(req);
    next();
});
app.use('/password', password);
app.use('/logout', logout);
app.use(auth.forcePasswordChange());
app.use('/', index);
app.use('/users', users);
app.use('/login', login);
app.use('/registration', registration);


// W ten sposób można ustalić ścieżkę, dla której zawsze wymagane bedzie logowanie
// Np. app.use('/student', auth.authenticate());, i potem wszystkie adresy typu 
// /student/podania itd. będą wymagały logowania
app.use('/tajemnice', auth.authenticate());
app.use('/tajemnice', tajemnice);

// Strony tylko dla administratorów
app.use('/admin', auth.authenticate());
app.use('/admin', auth.authorize('1'));
app.use('/admin/list', userLists);
app.use('/admin/subjects', subjectLists);

// Strony tylko dla nauczycieli
app.use('/teacher', auth.authenticate());
app.use('/teacher', auth.authorize('2'));
app.use('/teacher/subjects', subjectListsTeacher);

// Strony tylko dla studentów
app.use('/student', auth.authenticate());
app.use('/student', auth.authorize('3'));
app.use('/student/subjects', subjectListsStudent);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  logger.debug('Strona nie istnieje: ' + req.url);
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  logger.error(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
