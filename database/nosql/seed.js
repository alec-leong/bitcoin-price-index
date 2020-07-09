const axios = require('axios');
const Promise = require('bluebird');
const moment = require('moment');
const db = require('./index.js');
const Bitcoin = Promise.promisifyAll(require('./model.js'));

/**
 * Populate the database with historic Bitcoin price indices from '2013-09-01' to UTC current date
 * ('YYYY-MM-DD') at time of execution.
 *  - Execute GET request to CoinDesk's Bitcoin Price Index (BPI) API; may throw an error.
 *  - Execute insert query; may throw an error.
 *  - Handle each error.
 *  - Close database connection.
 */
(async () => {
  const startDate = '2013-09-01';
  const endDate = moment.utc().format('YYYY-MM-DD');
  const url = `https://api.coindesk.com/v1/bpi/historical/close.json?start=${startDate}&end=${endDate}`;

  try {
    const response = await axios.get(url);
    const { data: { bpi } } = response;

    const documents = Object.entries(bpi).reduce((accumulator, [date, price]) => {
      accumulator.push({
        _id: date,
        price,
      });

      return accumulator;
    }, []);

    const results = await Bitcoin.insertMany(documents);

    console.log(results);
  } catch (err) {
    console.error(err);
  } finally {
    db.close();
  }
})();
