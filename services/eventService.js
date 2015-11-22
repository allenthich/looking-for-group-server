"use strict";

var Event = require('../models/EventModel').event;
var User = require('../models/UserModel').user;
var Chat = require('../models/ChatModel').chat;
var userService = require('../services/userService.js');
var chatService = require('../services/chatService.js');
var timeService = require('../services/timeService.js');
var mongoose = require('mongoose');

var EventsService = {
    createEvent: function(eventInfo, api_token, callback) {
        eventInfo = JSON.parse(eventInfo);
        //console.log(eventInfo);
        //var s = Date.parse(eventInfo.startTime);
        //var e = Date.parse(eventInfo.endTime);
        //var l = Date.parse(eventInfo.lockTime);
        console.log("StartTime: ", eventInfo.startTime);
        console.log("EndTime: ", eventInfo.endTime);

        userService.getUserByToken(api_token, function(user) {
            Event.create({
                title:  eventInfo.title,
                description: eventInfo.description,
                location:   {
                    city: eventInfo.location.city,
                    state: eventInfo.location.state
                },
                startTime: Date.parse(eventInfo.startTime),
                activeEvent: true,
                endTime: Date.parse(eventInfo.endTime),
                category: eventInfo.category,
                organizer: user._id,
                minPeople: eventInfo.minPeople,
                maxPeople: eventInfo.maxPeople,
                minAge: eventInfo.minAge,
                maxAge: eventInfo.maxAge,
                numPeople: 1,
                lockTime: Date.parse(eventInfo.lockTime)
            }, function(err, tentativeEvent) {
                if (err) {
                    callback(err);
                } else {
                    callback(timeService.prettify(tentativeEvent));
                }
            });
        });
    },

    //To account for locked event, init privacy by deleting fields
    getEventDetails: function(eventId, callback) {
        var id = mongoose.Types.ObjectId(eventId.toString());
        Event.findById(id,function(err, doc) {
            var newObject = JSON.parse(JSON.stringify(doc));
            newObject['attendees'] = [];
            newObject['organizer'] = "";
            newObject = timeService.prettify(newObject);

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
                var prettyEvents = [];
                events.forEach(function(event) {
                    prettyEvents.push(timeService.prettify(event));
                });
                callback(prettyEvents);
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
    //Event deletion propagates to deleting chat
    deleteEvent: function(eventId, callback) {
        var id = mongoose.Types.ObjectId(eventId);
        Event.findByIdAndRemove(id, function(err, doc) {
            if (err) {
                callback(err);
            } else {
                chatService.deleteChat(doc.chatId, function(resp) {
                    callback(resp);
                });
            }
        });
    },
    endEvents: function() {
        Events.find({activeEvent: true, endTime: { $lt: Date.now() }}, function(err, events) {
            if (err) {
                console.log(err);
            } else {
                if (events.length == 0) {
                    return;
                } else {
                    events.forEach(function(event) {
                        event.attendees.forEach(function(userId) {
                            var uid = mongoose.Types.ObjectId(userId);
                            User.findByIdAndUpdate(uid,
                                { activeEvents: {$pull: event._id}, pastEvents: {$pushAll: event._id}} , function(err) {
                                    if (err) {
                                        console.log(err);
                                    }
                            });
                        });
                        event.activeEvent = false;
                    });

                }
            }

        })
    },
    getEventByCategory: function(category, token, callback) {
        //Find location then query categories, return list of event objects
        userService.getUserByToken(token, function(user) {
            Event.find({
                category: category,
                'location.city' : user.location.city,
                'location.state' : user.location.state,
                organizer: { $ne: user._id},
                lockTime: {$gt: Date.now()}
            }, function(err, events) {
                if (err) {
                    callback(err);
                } else {
                    var newEve = [];
                    events.forEach(function(event) {
                        newEve.push(timeService.prettify(event));
                    });
                    callback(newEve);
                }
            });
        });
    }
};

module.exports = EventsService;