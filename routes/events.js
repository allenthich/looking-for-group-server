var express = require('express');
var eventService = require('../services/eventService.js');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/join', function(req, res, next) {
    eventService.joinEvent(req.body.joinData, function(e) {
        if (e.status == 200)
            res.status(200);
        else
            res.status(403);
    });
});

router.post('/leave', function(req, res, next) {
    eventService.leaveEvent(req.body.leaveData, function(e) {
        if (e.status == 200)
            res.status(200);
        else
            res.status(403);
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
