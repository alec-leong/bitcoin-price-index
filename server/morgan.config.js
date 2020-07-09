require('dotenv').config();
const logger = require('../logger/index.js');

// morgan middleware configuration
const morganConfig = {
  format: process.env.NODE_ENV === 'development' ? 'dev' : 'combined',
  options: {
    ok: {
      skip: (req, res) => res.statusCode >= 400,
      stream: {
        write: (message) => logger.info(message, { type: 'morgan', pid: process.pid }),
      },
    },
    bad: {
      skip: (req, res) => res.statusCode < 400,
      stream: {
        write: (message) => logger.debug(message, { type: 'morgan', pid: process.pid }),
      },
    },
  },
};

module.exports = morganConfig;
