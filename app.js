var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var config = require('./config');

var indexRouter = require('./routes/index');
var symbolsRouter = require('./routes/symbols');
var featureClassesRouter = require('./routes/feature-classes');
var featuresRouter = require('./routes/features');
var tilesRouter = require('./routes/tiles');
var layersRouter = require('./routes/layers');
var mapsRouter = require('./routes/maps');
var labelsRouter = require('./routes/labels');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// CORS 
if (config.cors) {
    app.all('*', function(req, res, next) {
        //res.header("Access-Control-Allow-Origin", "http://localhost:9999");
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
        res.header("X-Powered-By",' 3.2.1');
        next();
    });
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/symbols', symbolsRouter);
app.use('/featureClasses', featureClassesRouter);
app.use('/features', featuresRouter);
app.use('/tiles', tilesRouter);
app.use('/layers', layersRouter);
app.use('/maps', mapsRouter);
app.use('/labels', labelsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
