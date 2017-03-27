var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passportConfig = require('./authentication/passportConfig');
var auth = require('./authentication/middleware');
var flash = require('express-flash');
var helpers = require('./controllers/helpers');

var index = require('./controllers/index');
var users = require('./controllers/users');
var login = require('./controllers/login');
var logout = require('./controllers/logout');
var tajemnice = require('./controllers/tajemnice');
var registration = require('./controllers/registration');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
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
app.use('/', index);
app.use('/users', users);
app.use('/login', login);
app.use('/logout', logout);
app.use('/registration', registration);

// W ten sposób można ustalić ścieżkę, dla której zawsze wymagane bedzie logowanie
// Np. app.use('/student', auth.authenticate());, i potem wszystkie adresy typu 
// /student/podania itd. będą wymagały logowania
app.use('/tajemnice', auth.authenticate());
app.use('/tajemnice', tajemnice);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
