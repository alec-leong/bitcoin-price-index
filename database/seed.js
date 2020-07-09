const axios = require('axios');
const moment = require('moment');
const sequelize = require('./index.js');
const Bitcoin = require('./model.js');

/**
 * Populate the database with historic Bitcoin price indices from '2013-09-01' to UTC current date
 * ('YYYY-MM-DD') at time of execution.
 *  - Execute GET request to CoinDesk's Bitcoin Price Index (BPI) API; may throw an error.
 *  - Start transaction.
 *  - Execute insert query; may throw an error.
 *    - On success: commit transaction
 *    - On error: rollback (abort) the transaction
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

    const records = Object.entries(bpi).reduce((accumulator, [date, price]) => {
      accumulator.push({
        date,
        price,
      });

      return accumulator;
    }, []);

    const t = await sequelize.transaction();

    try {
      await Bitcoin.bulkCreate(records, { transaction: t });
      await t.commit();
    } catch (err) {
      await t.rollback();

      console.error(err);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
})();
