require('dotenv').config();
const winston = require('winston');
const transport = require('./transport.js');

// Winston logger.
const logger = winston.createLogger({
  transports: [
    transport,
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
