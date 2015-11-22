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
    eventService.joinEvent(req.body.userId, req.body.eventId, function(e) {
        if (e.status == 200)
            res.sendStatus(200);
        else
            res.sendStatus(403);
    });
});

router.post('/leave', function(req, res, next) {
    eventService.leaveEvent(req.body.userId, req.body.eventId, function(e) {
        console.log(e)
        if (e.status == 200)
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

//Returns array of event user objects
router.get('/:eventId/attendees', function(req, res, next) {
    eventService.getAttendees(req.params.eventId, function(attendees) {
        res.json(attendees);
    });
});

//Returns array of eventIds of
router.get('/:state/:city', function(req, res, next) {
    eventService.getCityEvents(req.params.state, req.params.city, function(events) {
        res.json(events);
    });
});

module.exports = router;
