require('winston-daily-rotate-file');
const path = require('path');
const winston = require('winston');

const { transports: { DailyRotateFile } } = winston;

// Winston daily rotate file transport.
const transport = new DailyRotateFile({
  filename: path.join(__dirname, './log/%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  frequency: '24h',
  utc: true,
});

module.exports = transport;
