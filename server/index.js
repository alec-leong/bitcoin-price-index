require('dotenv').config();
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const logger = require('../logger/index.js');
const transport = require('../logger/transport.js');
const morganConfig = require('./morgan.config.js');
const CoinDesk = require('./CoinDesk.js');

const coinDesk = new CoinDesk();
const { base } = path.parse(__dirname);
const file = path.basename(__filename);
const relativePath = path.join(base, file);

const app = express();
const port = process.env.APP_SERVER_PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(compression());
app.use(morgan(morganConfig.format, morganConfig.options.ok)); // Log successful responses.
app.use(morgan(morganConfig.format, morganConfig.options.bad)); // Log bad responses.
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/bpi', async (req, res) => {
  try {
    const results = await coinDesk.bpi();

    res.send(results);
  } catch (err) {
    logger.error(err, {
      type: 'api',
      req: 'GET',
      route: '/bpi',
      file: relativePath,
      timestamp: new Date().toUTCString(),
      pid: process.pid,
    });

    res.status(500).send(err);
  }
});

app.listen(port, logger.info(`ExpressJS server listening on port ${port}`, {
  type: 'app',
  file: relativePath,
  timestamp: new Date().toUTCString(),
  pid: process.pid,
}));

transport.on('new', async () => {
  await coinDesk.insert();
});
