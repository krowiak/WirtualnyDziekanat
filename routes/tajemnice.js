var express = require('express');
var router = express.Router();

/* GET strona tylko dla zalogowanych. */
router.get('/', function(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        res.render('tajemnice');
    }
});

module.exports = router;