var express = require('express');
var router = express.Router();

var uzytkownicy = [{username:"admin", password:"H4sl0_"}]

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send(uzytkownicy);
});

module.exports = router;
