var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    req.viewData.title = 'Wirtualny dziekanat';
    res.render('index', req.viewData);
});

module.exports = router;
