"use strict";

var Event = require('../models/EventModel').event;
var User = require('../models/UserModel').user;
var Chat = require('../models/ChatModel').chat;
var Message = require('../models/MessageModel').msg;
var userService = require('../services/userService.js');
var mongoose = require('mongoose');

var ChatsService = {
    //Id already assoc. with Event
    createChat: function(id, eventId, userIds, callback) {
        Chat.create({
            _id: id,
            eventId:  eventId,
            people: userIds,
            messages: []
        }, function(err) {
            if (err) {
                callback(err);
            } else {
                callback({status: 200, message: "Chat created!"});
            }
        });
    },
    deleteChat: function(chatId, callback) {
        var id = mongoose.Types.ObjectId(chatId);
        Chat.findByIdAndRemove(id, function(err, callback) {
            if (err) { callback(err); }
            else {
                callback({status: 200, message: "Chat deleted!"});
            }
        })
    },
    //Create message and add to chat
    postMessage: function(chatId, messageData, callback) {
        var cid = mongoose.Types.ObjectId(chatId);
        var mid =  mongoose.Types.ObjectId();
        Message.create({
            _id: mid,
            message: messageData.message,
            creator: messageData.creator,
            timePosted: Date.now()
        }, function(err) {
            if (err) {
                callback(err);
            } else {
                Chat.findByIdAndUpdate(cid, { messages: {$pushAll: mid}}, function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback({status: 200, message: "Message posted!"})
                    }
                });
            }
        });
    },
    getMessage: function(messageId, callback) {
        var id = mongoose.Types.ObjectId(chatId);
        Message.findById(id, function(err, message) {
            if (err) {
                callback(err);
            } else {
                callback(message);
            }
        })
    },
    retrieveMessages: function(chatId, callback) {
        var self = this;
        var id = mongoose.Types.ObjectId(chatId);
        Chat.findById(id, function(err, chat) {
            if (err) {
                callback(err);
            } else {
                var messages = [];
                chat.messages.forEach(function(messageId) {
                    self.getMessage(messageId, function(msg) {
                        messages.push(msg);
                    });
                });
                callback(messages);
            }
        });
    }
};

module.exports = ChatsService;