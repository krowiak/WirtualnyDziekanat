var express = require('express');
var router = express.Router();
var passport = require('passport');


/* GET ekran logowania. */
router.get('/', function(req, res, next) {
  res.render('login', req.viewData);
});

router.post('/',
  passport.authenticate('local', { successRedirect: '/tajemnice',
                                   failureRedirect: '/login',
                                   failureFlash: true,
                                   successFlash: true
  })
);

module.exports = router;