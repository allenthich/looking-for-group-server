var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = new Schema({
    title:  String,
    description: String,
    location:   {
        city: String,
        state: String
    },
    startTime: Number,
    endTime: Number,
    activeEvent: Boolean,
    date: { type: Date, default: Date.now },
    category: String,
    organizer: String,
    minPerson: Number,
    maxPerson: Number,
    minAge: Number,
    maxAge: Number,
    numPeople: Number,
    lockTime: Number,
    attendees: [String]
});


exports.event = mongoose.model('Event', eventSchema);;