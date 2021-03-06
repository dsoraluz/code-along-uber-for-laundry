var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

dotenv.config();
mongoose.connect(process.env.MONGODB_URI);



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main-layout');
app.use(expressLayouts);
app.locals.title = 'Uber for Laundry';

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'uber for laundry and stuff pls',
  resave: true,
  saveUnitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// <input type="email"  name="email" id="email-input">
//
//
//

//Local strategy - authentication is comming from internal check of records.
passport.use(new LocalStrategy((email, password, next) => {
  //Check first if the database has an entry with that username.
  User.findOne({ email: email }, (err, user) => {
    if (err) {
      return next(err);
    }
    //if user exists (fail) (authentication failed)--(error message)
    else if (!user) {
      return next(null, false, { message: "Incorrect username" });
    }//If password does not match
    else if (!bcrypt.compareSync(password, user.encryptedPassword)) {
      return next(null, false, { message: "Incorrect password" });
    }else{
      //Retutn the user that we found.
      next(null, user);
    }

  });
}));

passport.serializeUser((user, cb)=>{
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findOne({ "_id": id }, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

var index = require('./routes/index');
var users = require('./routes/users');
const authRoutes = require('./routes/auth-routes.js');
app.use('/', index);
app.use('/users', users);
app.use('/', authRoutes);



// catch 404 and forward to error handler
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
