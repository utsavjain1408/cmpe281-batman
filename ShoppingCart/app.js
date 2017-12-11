var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);


// redis session
var redis_ip = '35.165.110.164'; 
var redis           =	  require("redis");
var redisStore      =	  require('connect-redis')(session);
var client          =     redis.createClient(6379, redis_ip);

var index = require('./routes/index');
var userRoutes = require('./routes/user');

var app = express();

// MongoClient.connect("mongodb://13.57.131.238:27017,13.57.134.28:27017,52.53.74.190:27017/shoppingcart?replicaSet=rs0",function(err,db){
//     if(err) throw err;

//     console.log("Connected To MongoDb");
// });
mongoose.connect('13.57.134.28:27017/shoppingcart');
// mongoose.connect('mongodb://13.57.131.238:27017/shoppingcart?replicaSet=rs0,mongodb://13.57.134.28:27017/shoppingcart?replicaSet=rs0,mongodb://52.53.74.190:27017/shoppingcart?replicaSet=rs0',{useMongoClient:true}, function(err, db){
//     if(err){
//         console.log("Error on connection");
//         console.log(err);
//     }else{
//         console.log("Connected");
//     }
// });
//mongoose.connect('mongodb://13.57.131.238:27017,13.57.134.28:27017,52.53.74.190:27017/shoppingcart?replicaSet=rs0',{useMongoClient:true});
//mongoose.connect('mongodb://34.215.102.31:27017,52.88.114.112:27017,54.70.234.254:27017/shoppingcart?replicaSet=rs0',{useMongoClient:true});

// mongoose.connect('mongodb://13.57.131.238:27017/shoppingcart?replicaSet=rs0',{useMongoClient:true}, function(err, db){
//     if(err){
//         console.log(err);
//     }else{
//         console.log("Connected");
//     }
// });
require('./config/passport');
// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
    secret: 'mysupersecret',
    resave: false,
    saveUninitialized: false,
    store: new redisStore({ host: redis_ip, port: 6379, client: client,ttl :  260000}),
    cookie: {maxAge: 180 * 60 * 1000}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

//setting the global variable 'login' which can be used by other files. Login is a boolean variable set to true, if user is authenticated
//make session available to other modules
app.use(function(req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});

app.use('/user', userRoutes);
app.use('/', index);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
