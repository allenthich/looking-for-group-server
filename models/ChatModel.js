var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatSchema = new Schema({
    eventId: String,
    messages: [String],
    people: [String]
});


exports.chat = mongoose.model('Chat', chatSchema);;