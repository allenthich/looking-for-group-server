var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name:  String,
    age: Number,
    description: String,
    location:   {
        city: String,
        state: String
    },
    activeEvents: [String],
    pastEvents: [String],
    organizedEvents: [Object],
    upcomingEvents: [Object],
    joinedEvents: [Object],
    date: { type: Date, default: Date.now },
    rating: {
        overall: Number,
        humor:  Number,
        polite:  Number,
        punctual:  Number,
        sociable:  Number,
        numRatings:  Number
    }
});

exports.user = mongoose.model('User', userSchema);