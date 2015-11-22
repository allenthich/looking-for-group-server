"use strict";

var Event = require('../models/EventModel').event;
var User = require('../models/UserModel').user;
var userService = require('../services/userService.js');
var mongoose = require('mongoose');

var EventsService = {
    //To account for locked event, init privacy by deleting fields
    getEventDetails: function(eventId, callback) {
        var id = mongoose.Types.ObjectId(eventId.toString());
        Event.findById(id,function(err, doc) {
            var newObject = JSON.parse(JSON.stringify(doc));
            newObject['attendees'] = [];
            newObject['organizer'] = "";

            if (err) console.log(err);
            if (doc.lockTime < Date.now()){
                doc.attendees.forEach(function(attendeeId) {
                    userService.getSimpleUser(attendeeId, function(user) {
                        newObject.attendees.push(user);
                    });
                });
                userService.getSimpleUser(doc.organizer, function(organizer) {
                    newObject['organizer'] = organizer;
                });
            }
            callback(doc);
        });
    },
    getCityEvents: function(eventId, callback) {
        //TODO: Get
    },
    joinEvent: function(userId, eventId, callback) {
        var uid = mongoose.Types.ObjectId(userId);
        var eid = mongoose.Types.ObjectId(eventId);
        User.findByIdAndUpdate(uid, { $addToSet: {activeEvents: eventId}},function(err) {
            if (err) callback(err);
            Event.findByIdAndUpdate(eid, { $addToSet: {attendees: userId}}, function(err) {
                if (err) callback(err);
                callback({status: 200});
            });
        });
    },
    leaveEvent: function(userId, eventId, callback) {
        var uid = mongoose.Types.ObjectId(userId);
        var eid = mongoose.Types.ObjectId(eventId);
        User.findByIdAndUpdate(uid, { $pull: {activeEvents: eventId}},function(err) {
            if (err) callback(err);
            Event.findByIdAndUpdate(eid, { $pull: {attendees: userId}}, function(err) {
                if (err) callback(err);
                callback({status: 200});
            });
        });
    }
};

module.exports = EventsService;