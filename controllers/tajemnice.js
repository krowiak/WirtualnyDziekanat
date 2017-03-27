var express = require('express');
var router = express.Router();

/* GET strona tylko dla zalogowanych. */
router.get('/', function(req, res, next) {
    res.render('tajemnice', req.viewData);
});

module.exports = router;