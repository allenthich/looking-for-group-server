"use strict";

var express = require('express');
var eventService = require('../services/eventService.js');
var userService = require('../services/userService.js');
var router = express.Router();

router.use(function (req, res, next) {
    req.token = req.body.api_token;
    if (!req.token) {
        req.token = req.params.api_token;
    }
    if (!req.token) {
        req.token = req.query.api_token;
    }
    console.log("Token: ", req.token);

    userService.checkAuthentication(req.token, function(resp) {
        if (resp.status != 200){
            res.sendStatus(401);
        } else {
            next();
        }
    });
});

router.post('/create', function(req, res, next) {
    eventService.createEvent(req.body.event, req.token, function(resp) {
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
router.get('/event/:eventId', function(req, res, next) {
    eventService.getEventDetails(req.params.eventId, function(event) {
        res.json(event);
    });
});

//Returns event meta data
router.delete('/event/:eventId', function(req, res, next) {
    eventService.deleteEvent(req.params.eventId, function(resp) {
        res.json(resp);
    });
});

//Returns array of eventIds of
router.get('/:state/:city', function(req, res, next) {
    eventService.getCityEvents(req.params.state, req.params.city, function(events) {
        res.json(events);
    });
});

//Returns array of eventIds of
router.get('/category', function(req, res, next) {
    eventService.getEventByCategory(req.query.category, req.token, function(events) {
        res.json(events);
    });
});

module.exports = router;
