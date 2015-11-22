"use strict";

var Event = require('../models/EventModel').event;
var User = require('../models/UserModel').user;
var mongoose = require('mongoose');

var EventsService = {
    getEventDetails: function(eventId, callback) {
        var id = mongoose.Types.ObjectId(eventId.toString());
        Event.findById(id,function(err, doc) {
            if (err) console.log(err);
            else callback(doc);
        });
    },
    getAttendees: function(eventId, callback) {
    //TODO: Get
    },
    getCityEvents: function(eventId, callback) {
        //TODO: Get
    },
    joinEvent: function(data, callback) {
        var uid = mongoose.Types.ObjectId(data.userId.toString());
        var eid = mongoose.Types.ObjectId(data.eventId.toString());
        User.findByIdAndUpdate(uid, { $push: {activeEvents: data.eventId}},function(err) {
            if (err) callback(err);
            Event.findByIdAndUpdate(eid, { $push: {attendees: data.userId}}, function(err) {
                if (err) callback(err);
                else callback({status: 200});
            });
        });
    },
    leaveEvent: function(data, callback) {
        var uid = mongoose.Types.ObjectId(data.userId.toString());
        var eid = mongoose.Types.ObjectId(data.eventId.toString());
        User.findByIdAndUpdate(uid, { $pull: {activeEvents: data.eventId}},function(err) {
            if (err) callback(err);
            Event.findByIdAndUpdate(eid, { $pull: {attendees: data.userId}}, function(err) {
                if (err) callback(err);
                else callback({status: 200});
            });
        });
    }
};

module.exports = EventsService;