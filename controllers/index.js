var express = require('express');
const helpers = require('./helpers');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    const layoutData = helpers.createLayoutData(req);
    layoutData.title = 'Wirtualny dziekanat';
    res.render('index', layoutData);
});

module.exports = router;
