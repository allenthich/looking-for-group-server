"use strict";

var User = require('../models/UserModel').user;
var Event = require('../models/EventModel').event;
var mongoose = require('mongoose');
var Q = require('q');
var request = require('request');
var crypto = require('crypto');
var timeService = require('../services/timeService.js');

var UserService = {
    checkAuthentication: function(auth_token, callback) {
        User.findOne({api_token: auth_token}, function(err, user) {
            if (err) {
                console.log(err)
                callback({status: 401});
            } else {
                if (user){
                    callback({status: 200});
                } else {
                    callback({status: 401});
                }
            }
        });
    },
    getUserByToken: function(token, callback) {
        User.findOne({api_token: token}, function(err, user) {
            if (err) {
                callback(err);
            } else {
                if (user){
                    callback(user);
                } else {
                    console.log("User not found");
                    callback(null);
                }
            }
        });
    },
    loginUser: function (fb_token, callback) {
        var self = this;
        verifyFacebookUserAccessToken(fb_token).then(function(user) {
            if (!user.message){
                self.getUserByFbId(user, function(respUser) {
                    callback(respUser);
                });
            } else {
                callback(user);
            }
        });

        // Call facebook API to verify the token is valid
        // https://graph.facebook.com/me?access_token=$token
        function verifyFacebookUserAccessToken(token) {
            var deferred = Q.defer();
            var path = 'https://graph.facebook.com/me?access_token=' + token;
            request(path, function (error, response, body) {
                var data = JSON.parse(body);
                if (!error && response && response.statusCode && response.statusCode == 200) {
                    var user = {
                        facebookUserId: data.id,
                        name: data.name
                    };
                    deferred.resolve(user);
                }
                else {
                    console.log(data.error);
                    //console.log(response);
                    deferred.reject({code: response.statusCode, message: data.error.message});
                    callback({code: response.statusCode, message: data.error.message});
                }
            });
            return deferred.promise;
        }
    },
    editUser: function (userData) {
        var id = mongoose.Types.ObjectId(userData.userId);
        User.findByIdAndUpdate(id, userData, function(err) {
            if (err) {
                callback(err);
            } else {
                callback();
            }
        });
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
            if (err) {
                callback(err);
            } else {
                var newObject = JSON.parse(JSON.stringify(doc));
                self.getOrganizedEvents(userId, function(organizedEvents) {
                    newObject.organizedEvents = organizedEvents;
                    self.getLockedEvents(userId, function(lockedEvents) {
                        newObject.upcomingEvents = lockedEvents;
                        self.getTentativeEvents(userId, function(pendingEvents) {
                            newObject.joinedEvents = pendingEvents;
                            callback(newObject);
                        });
                    });
                });
            }
        });
    },
    getUserByFbId: function(userObject, callback) {
        var self = this;
        User.findOne({facebookId: userObject.facebookUserId}, function(err, user) {
            if (err) {
                callback(err);
            }
            if (user) {
                var new_token = crypto.randomBytes(20).toString('hex');
                User.findByIdAndUpdate(user._id, {api_token: new_token}, function(err, doc) {
                    if (err) {
                        callback(err);
                    } else {
                        self.getUser(user._id, function(usrObj) {
                            var newUsr = JSON.parse(JSON.stringify(usrObj));
                            delete newUsr.api_token;
                            var container = {
                                api_token: usrObj.api_token,
                                user: newUsr
                            };
                            callback(container);
                        });
                    }
                });
            } else {
                //Create api token
                var api_token = crypto.randomBytes(20).toString('hex');
                User.create({
                    name: userObject.name,
                    facebookId: userObject.facebookUserId,
                    api_token: api_token
                }, function(err, user) {
                    var newUsr = JSON.parse(JSON.stringify(user));
                    delete newUsr.api_token;
                    var container = {
                        api_token: user.api_token,
                        user: newUsr
                    };
                    callback(container);
                });
            }
        });
    },
    getOrganizedEvents: function(userId, callback) {
        //Events GreaterThan time now
        Event.find({
            organizer: userId,
            lockTime: {$gt: Date.now()}
        }, function(err, docs) {
            if (err) {
                callback(err);
            } else {
                var prettyEvents = [];
                docs.forEach(function(doc) {
                    doc['attendees'] = [];
                    doc['organizer'] = "";
                    prettyEvents.push(timeService.prettify(doc));
                });
                callback(prettyEvents);
            }
        });
    },
    getLockedEvents: function(userId, callback) {
        var self = this;
        Event.find({
            $or: [{organizer: userId}, {attendees: {$in: [userId]}}],
            lockTime: {$lt: Date.now()},
            endTime: {$gt: Date.now()}
        }, function(err, docs) {
            if (err) {
                callback(err);
            } else {
                var lockedEvents = [];
                docs.forEach(function(doc) {
                    var newEvent = JSON.parse(JSON.stringify(doc));
                    newEvent.attendees = [];
                    newEvent = timeService.prettify(newEvent);
                    doc.attendees.forEach(function(attendeeId) {
                        self.getSimpleUser(attendeeId, function(userObj) {
                            newEvent.attendees.push(userObj);
                        });
                    });
                    lockedEvents.push(newEvent);
                });
                callback(lockedEvents);
            }
        });



        //var self = this;
        //var id = mongoose.Types.ObjectId(userId.toString());
        //User.findById(id, 'activeEvents', function(err, doc) {
        //    if (err) {
        //        callback(err);
        //    }
        //    else {
        //        var lockedEvents = [];
        //        if (doc.activeEvents.length == 0) {
        //            callback(lockedEvents);
        //        }
        //        for (var i = 0; i < doc.activeEvents.length; ++i) {
        //            Event.findOne({
        //                _id: mongoose.Types.ObjectId(doc.activeEvents[i].toString()),
        //                organizer: {$ne: userId }
        //            }, function (err, event) {
        //                if (err) callback(err);
        //                if (event != null) {
        //                    var newEvent = JSON.parse(JSON.stringify(event));
        //                    newEvent.attendees = [];
        //                    newEvent = timeService.prettify(newEvent);
        //                    //Find locked event that hasn't ended yet
        //                    if (event.lockTime < Date.now() && event.endTime > Date.now()) {
        //                        event.attendees.forEach(function(attendeeId) {
        //                            self.getSimpleUser(attendeeId, function(userObj) {
        //                                newEvent.attendees.push(userObj);
        //                            });
        //                        });
        //                        lockedEvents.push(newEvent);
        //                    }
        //                }
        //                if (i == doc.activeEvents.length)
        //                    callback(lockedEvents);
        //            });
        //        }
        //    }
        //});
    },
    getTentativeEvents: function(userId, callback) {

        Event.find({
            organizer: { $ne: userId},
            attendees: {$in: [userId]},
            lockTime: {$gt: Date.now()}
        }, function(err, docs) {
            if (err) {
                callback(err);
            } else {
                var tentEvents = [];
                docs.forEach(function(doc) {
                    doc['attendees'] = [];
                    doc['organizer'] = "";
                    tentEvents.push(timeService.prettify(doc));
                });
                callback(tentEvents);
            }
        });


        //var id = mongoose.Types.ObjectId(userId.toString());
        //User.findById(id, 'activeEvents', function(err, doc) {
        //    if (err) {
        //        callback(err);
        //    }
        //    else {
        //        var tentativeEvents = [];
        //        if (doc.activeEvents.length == 0) {
        //            callback(tentativeEvents);
        //        }
        //        for (var i = 0; i < doc.activeEvents.length; ++i) {
        //            Event.findOne({
        //                _id: mongoose.Types.ObjectId(doc.activeEvents[i].toString()),
        //                organizer: {$ne: userId.toString() }
        //            }, function (err, event) {
        //                if (err) callback(err);
        //                if (event != null) {
        //                    //Find tentative event (not locked) that hasn't ended yet
        //                    if (event.lockTime > Date.now() && event.endTime > Date.now()) {
        //                        event.attendees = [];
        //                        event.organizer = "";
        //                        event = timeService.prettify(event);
        //                        tentativeEvents.push(event);
        //                    }
        //                }
        //                if (i == doc.activeEvents.length)
        //                    callback(tentativeEvents);
        //            });
        //        }
        //    }
        //});
    }
};

module.exports = UserService;