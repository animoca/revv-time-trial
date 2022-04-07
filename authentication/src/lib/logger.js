import winston from 'winston';
const { combine, timestamp, colorize, printf } = winston.format;
const {File, Console} = winston.transports;

const printFormat = (info) => {
  const {
    timestamp, level, message, splat, ...args
  } = info;
  const ts = timestamp.slice(0, 19).replace('T', ' ');
  return `${ts} ${level}: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 0) : ''}`;
};

const transports = {};
transports.console = new Console({
  level: 'debug',
  handleExceptions: true,
  format: combine(colorize(), timestamp(), printf(printFormat)),
});

transports.file = new File({
  level: 'debug',
  filename: './logs/all-logs.log',
  handleExceptions: true,
  format: combine(timestamp(), printf(printFormat)),
  zippedArchive : true,
  maxsize: 5242880, //5MB
  maxFiles: 20,
  colorize: false,
});


winston.add(transports.console)
winston.add(transports.file)

export default winston;
export {winston as logger, transports};