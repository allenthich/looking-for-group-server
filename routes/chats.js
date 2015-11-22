"use strict";

var express = require('express');
var userService = require('../services/userService.js');
var chatService = require('../services/chatService.js');
var router = express.Router();

router.use(function (req, res, next) {
    userService.checkAuthentication(req.cookies.api_token, function(resp) {
        if (resp.status != 200){
            res.sendStatus(401);
        } else {
            next();
        }
    });
});

router.post('/create', function(req, res, next) {
    chatService.createChat(req.body.eventInfo, function(resp) {
        res.json(resp);
    });
});

router.get('/:chatId', function(req, res, next) {
    chatService.retrieveMessages(req.params.chatId, function(resp) {
        res.json(resp);
    });
});

router.post('/:chatId/message', function(req, res, next) {
    chatService.postMessage(req.params.chatId, req.body.messageData, function(resp) {
        res.json(resp);
    });
});


module.exports = router;
