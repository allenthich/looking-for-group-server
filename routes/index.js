var express = require('express');
var userService = require('../services/userService.js');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.post('/login', function(req, res, next) {
  userService.loginUser(req.body.fb_access_token, function(userObj) {
      res.json(userObj);
  });
});

module.exports = router;
