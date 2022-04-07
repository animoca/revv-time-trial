import {InternalError} from "./error";
import logger from "./logger";

const expressErrorHandler = (error, req, res, next) => {
  const err = InternalError.wrapError(error);
  res.status(err.httpCode || 500);
  let log;
  switch (err.logLevel) {
    case "warn":
      log = logger.warn;
      break;
    case "info" :
      log = logger.info;
      break;
    case "debug" : 
      log = logger.debug;
      break;
    case "silly":
      log = logger.silly;
      break;
    default:
      log = logger.error;
      break;
  }

  if(err.logStack) {
    log(`${err.constructor.name} ${err.message}`,  {method: req.method, url:req.url, body:req.body || "" , stack : err.stack})
  } else {
    log(`${err.constructor.name} ${err.message}`,  {method: req.method, url:req.url, body:req.body || ""});
  }
  res.json(err.toJson());

}

export {expressErrorHandler};