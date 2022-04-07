const express = require('express');
const cookieParser = require('cookie-parser');
const expressWinston = require('express-winston');
const logger = require('winston');
const {UnknownApiError, InternalError} = require('@animocabrands/backend-common_library');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const app = express();
const cors = require('cors');
import {DefaultCorsOption} from '@animocabrands/backend-common_library';
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(cors(DefaultCorsOption));

app.use('/', indexRouter);
app.use('/user', usersRouter);

app.use(function(req, res, next) {
    next(new UnknownApiError());    
});
  
// error handler
app.use(function(e, req, res, next) {
// set locals, only providing error in development
    // const err = InternalError.wrapError(e);
    const err = e;

    var origin = req.header('Origin');

    res.locals.message = err.message;
    res.locals.error = err;

    // render the error page
    res.status(err.httpCode || 500);
    var response = req.body.params ? req.body : {};
    let log;
    if(err.logLevel == "warn") {
        log = logger.warn;
    } else if(err.logLevel == "error") {
        log = logger.error;
    } else {
        log = logger.info;
    }
    if(err.logStack) {
        log(`${err.constructor.name} ${err.message}`,  {method: req.method, url:req.url, body:req.body || "" , stack : err.stack})
    } else {
        log(`${err.constructor.name} ${err.message}`,  {method: req.method, url:req.url, body:req.body || ""});
    }
    
    if(response.params) 
        response.params.error = err;
    else 
        response = { error : err };
    res.json(response);
});

app.use(expressWinston.errorLogger({
    winstonInstance : logger 
}));

module.exports = app;
