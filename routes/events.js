"use strict";

var express = require('express');
var eventService = require('../services/eventService.js');
var userService = require('../services/userService.js');
var router = express.Router();

router.use(function (req, res, next) {
    userService.checkAuthentication(req.cookies.api_token, function(resp) {
        if (resp.status != 200){
            res.sendStatus(401);
        } else {
            next();
        }
    });
});

router.post('/join', function(req, res, next) {
    eventService.createEvent(req.body.eventInfo, function(resp) {
        res.json(resp);
    });
});

router.post('/join', function(req, res, next) {
    eventService.joinEvent(req.body.userId, req.body.eventId, function(resp) {
        if (resp.status == 200)
            res.sendStatus(200);
        else
            res.sendStatus(403);
    });
});

router.post('/leave', function(req, res, next) {
    eventService.leaveEvent(req.body.userId, req.body.eventId, function(resp) {
        if (resp.status == 200)
            res.sendStatus(200);
        else
            res.sendStatus(403);
    });
});

//Returns event meta data
router.get('/:eventId', function(req, res, next) {
    eventService.getEventDetails(req.params.eventId, function(event) {
        res.json(event);
    });
});

//Returns event meta data
router.delete('/:eventId', function(req, res, next) {
    eventService.deleteEvent(req.params.eventId, function(resp) {
        res.json(resp);
    });
});

//Returns array of eventIds of
router.get('/:state/:city', function(req, res, next) {
    console.log("hit")
    eventService.getCityEvents(req.params.state, req.params.city, function(events) {
        res.json(events);
    });
});

module.exports = router;
