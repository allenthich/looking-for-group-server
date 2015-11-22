var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema({
    creator:  String,
    postTime: Number,
    message: String
});


exports.msg = mongoose.model('Message', messageSchema);