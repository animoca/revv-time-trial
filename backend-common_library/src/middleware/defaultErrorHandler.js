import {InternalError} from "../error";
import logger from "winston";

const defaultErrorHandler = (e, req, res, next) => {
  const err = InternalError.wrapError(e);
  res.locals.message = err.message;
  res.locals.error = err;
  // render the error page
  res.status(err.httpCode || 500);
  var response = req.body ? req.body : {};
  
  // const errors  = winston.exceptions.getAllInfo(err);
  let logFn;
  if(err.logLevel == "warn") {
      logFn = logger.warn;
  } else if(err.logLevel == "error") {
      logFn = logger.error;
  } else if(err.logLevel == "debug") {
      logFn = logger.debug;
  } else if(err.logLevel == "silly" || err.logLevel == "trace") {
      logFn = logger.silly;
  } else {
      logFn = logger.info;
  }
  if(err.logStack) {
      logFn(`${err.constructor.name} ${err.message}`, {method: req.method, url:req.url, body:req.body || "" , stack : err.stack});
  } else {
      logFn(`${err.constructor.name} ${err.message}`, {method: req.method, url:req.url, body:req.body || ""});
  }
  
  if(response.params) 
      response.params.error = err.toJson()
  else 
      response = { error : err.toJson() }
  res.json(response);
  
}


export {defaultErrorHandler};