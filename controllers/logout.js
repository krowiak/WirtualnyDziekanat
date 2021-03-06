var express = require('express');
var router = express.Router();

// Wylogowanie powinno być POSTem,
// ale też prawdopodobnie nie powinno być stroną, więęęc zostawiam.
router.get('/', function(req, res, next) {
    	req.logOut();
    	req.flash('info', 'Wylogowano użytkownika.')
        res.redirect('/');
});

module.exports = router;