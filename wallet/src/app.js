import express  from 'express';
import cookieParser from 'cookie-parser';
import indexRouter  from './routes/index';
import {DefaultCorsOption, UnknownApiError, InternalError} from '@animocabrands/backend-common_library';
import cors from "cors";
import logger from "winston";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors(DefaultCorsOption));

app.use('/', indexRouter);

app.use((req, res, next) => {
    next(new UnknownApiError(`cannot handle ${req.path}`));    
});


app.use(function(e, req, res, next) {
  // set locals, only providing error in development
      const err = InternalError.wrapError(e);  
      res.locals.message = err.message;
      res.locals.error = err;
  
      // render the error page
      res.status(err.httpCode || 500);
      var response = req.body.params ? req.body : {};
      // const errors  = winston.exceptions.getAllInfo(err);
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
          response.params.error = err.toJson()
      else 
          response = { error : err.toJson() }
      res.json(response);
  });

export default app;