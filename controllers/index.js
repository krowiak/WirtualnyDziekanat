var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    req.viewData.title = 'Dziekanator3000';
    res.render('index', req.viewData);
});

module.exports = router;
