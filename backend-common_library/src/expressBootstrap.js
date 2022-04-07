import "core-js/stable";
import "regenerator-runtime/runtime";
import logger from "./logger";
import http from "http";
import serverless from "serverless-http";
import express, {json, urlencoded} from "express";
import {errorLogger} from 'express-winston';
import {defaultErrorHandler} from "./middleware/defaultErrorHandler";
import { UnknownApiError } from "./error";
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

const configureBasicMiddleware = (app, middlewares) => {
  const unknownApiMiddleware = (req, res, next) => {
    next(new UnknownApiError(`Cannot handle ${req.method} ${req.url}`));
  };
  const winstonLoggerMiddleware = errorLogger({
    winstonInstance : logger 
  });

  app.use([
    json(),
    urlencoded({ extended: false }),
    ...middlewares,
    unknownApiMiddleware,
    defaultErrorHandler,
    winstonLoggerMiddleware
  ]);
  return app;
}

// bootstrap to 
const expressServerBootstrap = (app, middlewares = []) => {
  var port = normalizePort(process.env.PORT || '3000');
  app.set('port', port);
  app = configureBasicMiddleware(app,middlewares);
  var server = http.createServer(app);
  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  server.on('listening', () => {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    logger.info(`Process ID ${process.pid}`)
    logger.info(`Node Version ${process.version}`)
    logger.info(`Listening on ${bind}`);
  });

  server.listen(port, "0.0.0.0");
  return server;
}

const expressServerlessBootstrap = (app) => {
  configureBasicMiddleware(app);
  return serverless(app);
}

export {expressServerBootstrap, expressServerlessBootstrap};