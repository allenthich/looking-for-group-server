var User = require('../models/UserModel').user;
var Event = require('../models/EventModel').event;
var mongoose = require('mongoose');

var UserService = {
    createUser: function (userData) {
      //TODO: Create model
    },
    getUser: function(userId, callback) {
        var id = mongoose.Types.ObjectId(userId.toString());
        User.findById(id,function(err, doc) {
            if (err) console.log(err);
            else callback(doc);
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
                    callback(doc);
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
                    Event.find(mongoose.Types.ObjectId(doc.activeEvents[i].toString()), function (err, event) {
                        var firstEvent = event[0];
                        //Find locked event that hasn't ended yet
                        if (firstEvent.lockTime < Date.now() && firstEvent.endTime > Date.now()) {
                            lockedEvents.push(firstEvent);
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
                    Event.find(mongoose.Types.ObjectId(doc.activeEvents[i].toString()), function (err, event) {
                        var firstEvent = event[0];
                        //Find tentative event (not locked) that hasn't ended yet
                        if (firstEvent.lockTime > Date.now() && firstEvent.endTime > Date.now()) {
                            firstEvent.attendees = [];
                            firstEvent.organizer = "";
                            tentativeEvents.push(firstEvent);
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