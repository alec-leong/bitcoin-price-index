require('dotenv').config();
const axios = require('axios');
const moment = require('moment');
const path = require('path');
const winston = require('winston');
const { DataTypes, Model, QueryTypes } = require('sequelize');
const sequelize = require('../database/index.js');
const transport = require('../logger/transport.js');
const Bitcoin = require('../database/model.js');

/**
 * Class representating CoinDesk.
 */
class CoinDesk {
  // Private instance and class properties.
  #startDate;
  #endDate;
  static #scheme = 'https';
  static #domain = 'api.coindesk.com';
  static #path = 'v1/bpi/historical';
  static #resource = 'close.json';
  static #logger = winston.createLogger({
    transports: [
      transport,
    ],
  });
  static #relativePath = path.join(path.parse(__dirname).base, path.basename(__filename));
  static #queryOptions = {
    select: {
      type: QueryTypes.SELECT,
    },
  };

  /**
   * Set the instance's #startDate property.
   * Select query to get the most recent date.
   *  - On success, #startDate is initialized to the most recent date ('YYYY-MM-DD') in the database.
   *    If no date exists, then #startDate is initialized to '2013-09-01'.
   *  - On error, throw error.
   */
  async setStartDate() {
    // SELECT date FROM bitcoin ORDER BY date DESC LIMIT 1;
    const result = await Bitcoin.findAll({ // Expect: [ { date: 'YYYY-MM-DD' } ]
      attributes: ['date'],
      order: [
        ['date', 'DESC'],
      ],
      limit: 1,
      raw: true,
    });

    if (result.length) { // If non-empty result array...
      const [record] = result;
      const { date } = record;

      if (date) { // If date is truthy...
        this.#startDate = moment(date).add(1, 'day').format('YYYY-MM-DD'); // 'YYYY-MM-DD'
      } else {
        this.#startDate = '2013-09-01';
      }
    } else {
      this.#startDate = '2013-09-01';
    }
  }

  /**
   * Populate the database with recent Bitcoin price indices.
   *  - Initialize #startDate property if falsey; may throw an error.
   *  - Execute GET request to CoinDesk's Bitcoin Price Index (BPI) API; may throw an error.
   *  - Execute insert query; may throw an error.
   *  - Handle each error.
   */
  async insert() {
    try {
      if (!this.#startDate) { // If startDate is falsey...
        await this.setStartDate();
      }

      this.#endDate = moment.utc().format('YYYY-MM-DD');
      const url = `${CoinDesk.#scheme}://${CoinDesk.#domain}/${CoinDesk.#path}/${CoinDesk.#resource}?start=${this.#startDate}&end=${this.#endDate}`;

      try {
        const response = await axios(url);
        const { data } = response;
        const { bpi } = data;
        const records = Object.entries(bpi).reduce((accumulator, [date, price]) => {
          accumulator.push({
            date,
            price,
          });
    
          return accumulator;
        }, []);
        
        // Start transaction.
        const transaction = await sequelize.transaction();

        try {
          await Bitcoin.bulkCreate(records, { transaction, ignoreDuplicates: true, });
          // On success: commit transaction.
          await transaction.commit();

          // Update startDate to most recent date populated in db.
          const { date } = records[records.length - 1]; // { date: 'YYYY-MM-DD', price: '[0-9]+.[0-9]+' }
          this.#startDate = date;
        } catch (err) { // Handle insert query error.
          // Log error.
          CoinDesk.#logger.error(err, {
            type: 'db',
            query: 'insert',
            file: CoinDesk.#relativePath,
            timestamp: new Date().toUTCString(),
            pid: process.pid,
          });      

          // Rollback transaction.
          await transaction.rollback();    
        }
      } catch (err) { // Handle axios error.
        try {
          CoinDesk.#logger.error(err, { 
            type: 'CoinDesk API',
            request: 'GET',
            url: err.config.url,
            status: err.response.status, 
            data: err.response.data, 
            file: CoinDesk.#relativePath,
            timestamp: new Date().toUTCString(),
            pid: process.pid,
          });
        } catch (err) { // Handle TypeError: cannot read property '<property name>' of undefined.
          CoinDesk.#logger.error(err, { 
            type: 'CoinDesk API',
            request: 'GET',
            url: url,
            status: 'bad', 
            file: CoinDesk.#relativePath,
            timestamp: new Date().toUTCString(),
            pid: process.pid,
          });
        }
      }
    } catch (err) { // Handle select query error.
      CoinDesk.#logger.error(err, {
        type: 'db',
        query: 'select',
        file: CoinDesk.#relativePath,
        timestamp: new Date().toUTCString(),
        pid: process.pid,
      });      
    }
  }

  /**
   * Execute select query to read all bitcoin price indices to initialize ChartJS data.
   * @return {Array} An array of objects representing a bitcoin price index market summary.
   * Each object represents a point with keys ['x', 'y'] where 'x' denotes date (YYYY-MM-DD) and 'y' denotes price (Number).
   * E.g. [ { x: '2013-09-01', y: '128.2597' }, { x: '2013-09-02', y: '127.2597' } ].
   */
  async bpi () {
    const data = await sequelize.query('SELECT date AS x, price as y FROM bitcoin', CoinDesk.#queryOptions.select);
    return data;
  }

  /**
   * Adds console transport to the class' logger.
   */
  static addLogToConsole() {
    CoinDesk.#logger.add(new winston.transports.Console({ format: winston.format.simple() }));
  }
}

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  CoinDesk.addLogToConsole();
}

module.exports = CoinDesk;
