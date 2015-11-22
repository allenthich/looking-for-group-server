"use strict";

var User = require('../models/UserModel').user;
var Event = require('../models/EventModel').event;
var mongoose = require('mongoose');

var UserService = {
    createUser: function (userData) {
      //TODO: Create model
    },
    editUser: function (userData) {
    //TODO: Edit Model
    },
    getSimpleUser: function(userId, callback) {
        var id = mongoose.Types.ObjectId(userId.toString());
        User.findById(id, '_id description birthday location rating', function(err, doc) {
            if (err) console.log(err);
            else {
                //TODO: Calculate and store in prop age form bday
                callback(doc);
            }
        });
    },
    //Returns user with populated event objects
    getUser: function(userId, callback) {
        var self = this;
        var id = mongoose.Types.ObjectId(userId.toString());
        User.findById(id, function(err, doc) {
            if (err) console.log(err);
            else {
                var newObject = JSON.parse(JSON.stringify(doc));
                self.getOrganizedEvents(userId, function(organizedEvents) {
                    newObject['organizedEvents'] = organizedEvents;
                    self.getLockedEvents(userId, function(lockedEvents) {
                        newObject.upcomingEvents = lockedEvents;
                        self.getTentativeEvents(userId, function(pendingEvents) {
                            newObject.joinedEvents = pendingEvents;
                            callback(newObject)
                        });
                    });
                });
            }
        });
    },
    getOrganizedEvents: function(userId, callback) {
        //Events GreaterThan time now
        Event.find({
            organizer: userId,
            endTime: { $gt: Date.now()}
        }, function(err, docs) {
            if (err) console.log(err);
            docs.forEach(function(doc) {
                if (doc.lockTime > Date.now()){
                    doc['attendees'] = [];
                    doc['organizer'] = "";
                }
                if (docs.lastIndexOf(doc) + 1 == docs.length)
                    callback(docs);
            });
        });
    },
    getLockedEvents: function(userId, callback) {
        var id = mongoose.Types.ObjectId(userId.toString());
        User.findById(id, 'activeEvents', function(err, doc) {
            if (err) console.log(err);
            else {
                var lockedEvents = [];
                for (var i = 0; i < doc.activeEvents.length; ++i) {
                    Event.findOne({
                        _id: mongoose.Types.ObjectId(doc.activeEvents[i].toString()),
                        organizer: {$ne: userId }
                    }, function (err, event) {
                        if (err) callback(err);
                        if (event != null) {
                            //Find locked event that hasn't ended yet
                            if (event.lockTime < Date.now() && event.endTime > Date.now()) {
                                lockedEvents.push(event);
                            }
                        }
                        if (i == doc.activeEvents.length)
                            callback(lockedEvents);
                    });
                }
            }
        });
    },
    getTentativeEvents: function(userId, callback) {
        var id = mongoose.Types.ObjectId(userId.toString());
        User.findById(id, 'activeEvents', function(err, doc) {
            if (err) console.log(err);
            else {
                var tentativeEvents = [];
                for (var i = 0; i < doc.activeEvents.length; ++i) {
                    Event.findOne({
                        _id: mongoose.Types.ObjectId(doc.activeEvents[i].toString()),
                        organizer: {$ne: userId.toString() }
                    }, function (err, event) {
                        if (err) callback(err);
                        if (event != null) {
                            //Find tentative event (not locked) that hasn't ended yet
                            if (event.lockTime > Date.now() && event.endTime > Date.now()) {
                                event.attendees = [];
                                event.organizer = "";
                                tentativeEvents.push(event);
                            }
                        }
                        if (i == doc.activeEvents.length)
                            callback(tentativeEvents);
                    });
                }
            }
        });
    }
};

module.exports = UserService;