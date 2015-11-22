"use strict";

var Event = require('../models/EventModel').event;
var User = require('../models/UserModel').user;
var userService = require('../services/userService.js');
var mongoose = require('mongoose');

var EventsService = {
    createEvent: function(eventInfo, callback) {
        Event.create({
            title:  eventInfo.title,
            description: eventInfo.description,
            location:   {
                city: eventInfo.city,
                state: eventInfo.state
            },
            startTime: eventInfo.startTime,
            endTime: eventInfo.endTime,
            category: eventInfo.category,
            organizer: eventInfo.organizer,
            minPerson: eventInfo.minPerson,
            maxPerson: eventInfo.maxPerson,
            minAge: eventInfo.minAge,
            maxAge: eventInfo.maxAge,
            numPeople: eventInfo.numPeople,
            lockTime: eventInfo.lockTime
        }, function(err) {
            if (err) {
                callback(err);
            } else {
                callback({status: 200, message: "Event created!"});
            }
        });
    },

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
    getCityEvents: function(state, city, callback) {
        Event.find({
            location: {
                city: city,
                state: state
            }, lockTime: {
                $gt: Date.now()
                }
            }, '-attendees -organizer', function(err, events){
            if (err) {
                callback(err);
            } else {
                callback(events);
            }
        })
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
    },
    deleteEvent: function(eventId, callback) {
        var id = mongoose.Types.ObjectId(eventId);
        Event.findByIdAndRemove(id, function(err) {
            if (err) {
                callback(err);
            } else {
                callback({status: 200, message: "Event deleted!"});
            }
        });
    }
};

module.exports = EventsService;