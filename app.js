var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var routes = require('./routes/index');
var users = require('./routes/users');
var events = require('./routes/events');
var chats = require('./routes/chats');

mongoose.connect('mongodb://alengeo:fort20twenty@candidate.56.mongolayer.com:10519,candidate.55.mongolayer.com:10558/LFG?replicaSet=set-56500e1b74a290e4be0000fd')


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/chats', chats);
app.use('/events', events);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//var CronJob = require('cron').CronJob;
//
////Init group chat assoc. chat with event
//var checkLockingEvents = new CronJob('0 */1 * * * *', function() {
//    }, function () {
//      /* This function is executed when the job stops */
//    },
//    true
//);
//
////Move events to pastEvents
//var checkEndingEvents = new CronJob('0 */1 * * * *', function() {
//    }, function () {
//
//    },
//    true
//);

module.exports = app;
