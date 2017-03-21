var express = require('express');
var router = express.Router();
var passport = require('passport')


/* GET ekran logowania. */
router.get('/', function(req, res, next) {
  res.render('login');
});

// router.post('/', function(req, res) {
//   res.send('Logowanie: ' + req.param('username'));
// });
router.post('/',
  passport.authenticate('local', { successRedirect: '/tajemnice',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

module.exports = router;