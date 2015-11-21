var express = require('express');
var userService = require('../services/userService.js');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//Creates user
router.post('/create', function(req, res, next) {
  userService.createUser(req.body.userData, function(status) {
    res.send(status);
  });
});

//Returns user meta data
router.get('/:userId', function(req, res, next) {
  userService.getUser(req.params.userId, function(user) {
    res.json(user);
  });
});

//Returns array of event objects I'm organizing
router.get('/:userId/organizing', function(req, res, next) {
  userService.getOrganizedEvents(req.params.userId, function(user) {
    res.json(user);
  });
});

//Returns array of event objects I'm attending
router.get('/:userId/locked', function(req, res, next) {
  userService.getLockedEvents(req.params.userId, function(user) {
    res.json(user);
  });
});

//Returns array of event objects I'm queued for
router.get('/:userId/tentative', function(req, res, next) {
  userService.getTentativeEvents(req.params.userId, function(user) {
    res.json(user);
  });
});

module.exports = router;
