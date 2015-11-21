var Event = require('../models/EventModel').event;
var mongoose = require('mongoose');

var EventsService = {
    getEvent: function(eventId, callback) {
        var id = mongoose.Types.ObjectId(eventId.toString());
        Event.findById(id,function(err, doc) {
            if (err) console.log(err);
            else callback(doc);
        });
    }
};

module.exports = EventsService;