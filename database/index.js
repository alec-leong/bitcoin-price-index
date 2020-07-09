require('dotenv').config();
const path = require('path');
const Promise = require('bluebird');
const exec = Promise.promisify(require('child_process').exec);
const { Sequelize } = require('sequelize');
const logger = require('../logger/index.js');

const database = process.env.DB_NAME || 'cryptocurrency';
const username = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASS || '';
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 5432;

const { base } = path.parse(__dirname);
const file = path.basename(__filename);
const relativePath = path.join(base, file);

// Instantiate sequelize with name of database, username and password.
const sequelize = new Sequelize(database, username, password, {
  host, // The host of the relational database.
  dialect: 'postgres', // The dialect of the database you are connecting to. One of mysql, postgres, sqlite and mssql.
  port, // The port of the relational database.
  logging: false, // Disable Sequelize logging function.
});

/**
 * Authenticate PostgreSQL connection.
 *  - On success:
 *    - Log connection.
 *  - On error:
 *    - Log error.
 *    - If '3D000' error code, then execute command to seed database; may throw an error.
 *      Otherwise, terminate program.
 *      - If error thrown, then log error.
 */
(async () => {
  try {
    await sequelize.authenticate();

    logger.info('Database connection has been established successfully.', {
      type: 'db',
      connection: 1,
      file: relativePath,
      timestamp: new Date().toUTCString(),
      pid: process.pid,
    });
  } catch (err) {
    logger.error(err, {
      type: 'db',
      connection: 0,
      file: relativePath,
      timestamp: new Date().toUTCString(),
      pid: process.pid,
    });

    // postgresql v12 error codes: https://www.postgresql.org/docs/12/errcodes-appendix.html
    if ((err.parent.code === '3D000' || err.original.code === '3D000')) { // if database does not exist...
      const schemaFilePath = path.join(__dirname, './schema.sql');
      const seedFilePath = path.join(__dirname, './seed.js');
      const command = `psql -U postgres < "${schemaFilePath}" && node "${seedFilePath}"`;
      const loggerOptions = {
        type: 'seed',
        runtime: 'node',
        module: 'child_process',
        method: 'exec',
        command,
        file: relativePath,
        timestamp: null,
        pid: process.pid,
      };

      // try-exec-catch: stdout and stderr undefined
      // solution: then-able exec method
      exec(command)
        .then(async (stdout) => {
          loggerOptions.timestamp = new Date().toUTCString();
          const message = stdout.replace(/\s+info.*/, ''); // Remove winston logger console transport output from stdout.
          logger.info(message, loggerOptions);
        })
        .catch((execErr) => {
          loggerOptions.timestamp = new Date().toUTCString();
          logger.error(execErr, loggerOptions);
          process.exit(1);
        });
    } else {
      process.exit(1);
    }
  }
})();

module.exports = sequelize;
