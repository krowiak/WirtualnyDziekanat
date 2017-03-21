var express = require('express');
var router = express.Router();

/* GET strona tylko dla zalogowanych. */
router.get('/', function(req, res, next) {
    	req.logOut();
        res.redirect('/login');
});

module.exports = router;