var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
/* Added Manually*/
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
const fileUpload = require('express-fileupload');
//var cors = require('cors');
/*************/

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var servicesRouter = require('./routes/services');
var friendsRouter = require('./routes/friends');
var paymentRoutes = require('./routes/payment');
var bankRoutes = require('./routes/bank');
var chargesRoutes = require('./routes/charges');
var bankpaypalRoutes = require('./routes/bankpaypal');
var apiRoutes = require('./routes/apiRoutes');
var adminRoutes = require('./routes/adminRoutes');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
////////////////
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    // limit: '20mb',
    extended: true
}));
//app.use(cors());
app.use(fileUpload());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/services', servicesRouter);
app.use('/friends', friendsRouter);
app.use('/payment', paymentRoutes);
app.use('/bank', bankRoutes);
app.use('/charges', chargesRoutes);
app.use('/bankpaypal', bankpaypalRoutes);
// app.use('/api', apiRoutes);
// app.use('/adminApi', adminRoutes);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// catch 404 and forward to error handler
//===========================CORS support==============================
app.use(function (req, res, next) {
    //req.setEncoding('utf8');
    // Website you wish to allow to connect
    res.header("Access-Control-Allow-Origin", "*");

    // Request methods you wish to allow
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

    // Request headers you wish to allow
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");

    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
});


// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;