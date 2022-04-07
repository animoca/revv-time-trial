import winston from 'winston';
const { combine, simple, timestamp, colorize, align, prettyPrint, json, printf, splat } = winston.format;
const { File, Console } = winston.transports;

const printFormat = (info) => {
  let {
    timestamp, level, message, ...args
  } = info;
  const splat = args[Symbol.for('splat')];
  const ts = timestamp.slice(0, 19).replace('T', ' ');
  if (!message) {
    message = args[Symbol.for('message')];
  } else if (message instanceof Error) {
    message = message.message;
  } else if (typeof message != "string") {
    try {
      message = JSON.stringify(message);
    } catch (e) {
      message = message.toString();
    }
  } else if (message.endsWith("[object Arguments]")) {
    message = message.replace("[object Arguments]", "");
  }
  
  let formattedSplat = [];
  if(splat) {
    formattedSplat = splat.map( (obj) => {
      let string;
      if(obj instanceof Error) {
        string = obj.stack;
      } else {
        try {
          string = JSON.stringify(obj, null, 0);
        } catch {
          string = obj.toString();
        }
      }
      return string;
    });
  }

  return `${ts} ${level}: ${message} ${(formattedSplat && Object.keys(formattedSplat).length) ? formattedSplat : ''}`;
};

const consoleAppender = new Console({
  level: process.env.LOG_LEVEL || "silly",
  handleExceptions: true,
  handleRejections: true,
  format: combine(timestamp(), json()),
});

const coloredConsoleAppender = new Console({
  level: process.env.LOG_LEVEL || "silly",
  handleExceptions: true,
  handleRejections : true,
  format: combine(colorize(), timestamp(), printf(printFormat)),
});

const fileAppender = new File({
  level: process.env.LOG_LEVEL || "silly",
  filename: './logs/all-logs.log',
  handleExceptions: true,
  format: combine(timestamp(), printf(printFormat)),
  zippedArchive: true,
  maxsize: 5242880, //5MB
  maxFiles: 20,
  colorize: false,
});

const transports = {
  console : consoleAppender,
  colorConsole : coloredConsoleAppender,
  file : fileAppender
};

function setupLogger() {
  winston.clear();
  winston.id = Math.random();
  const TRANSPORT_CONF = (process.env.LOG_TRANSPORT || "console" ).split(",");
  for (let name of TRANSPORT_CONF) {
    const transport = transports[name];
    if(transport) {
      winston.add(transport);
    }
  }
}

const polyfillConsole = () => {
  setupLogger();
  console.log = function () {
    winston.debug.apply(winston, arguments);
  }

  console.info = function () {
    winston.info.apply(winston, arguments);
  }

  console.warn = function () {
    winston.warn.apply(winston, arguments);
  }

  console.error = function () {
    winston.error.apply(winston, arguments);
  }

  console.debug = function () {
    winston.debug.apply(winston, arguments);
  }

  console.trace = function () {
    winston.silly.apply(winston, arguments);
  }

}

export default winston;
export { winston, winston as logger, setupLogger, polyfillConsole, printFormat as winstonPrintFormat };