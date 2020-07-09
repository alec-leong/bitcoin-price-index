require('dotenv').config();
const mongoose = require('mongoose');

const DB_HOST = process.env.MONGODB_HOST || '127.0.0.1';
const DB_PORT = process.env.MONGODB_PORT || 27017;
const DB_SERVER = `${DB_HOST}:${DB_PORT}`;
const DB_NAME = process.env.MONGODB_NAME || 'cryptocurrency';
const URI = `mongodb://${DB_SERVER}/${DB_NAME}`;
const OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };

// initial connection and handle initial connection errors
mongoose.connect(URI, OPTIONS)
  .then(() => console.log('MongoDB connection has been established successfully.'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// connection to database
const db = mongoose.connection;

// handle errors after initial connection was established by listening for error events on the conn.
db.on('error', console.error.bind(console, 'connection error:'));

// successful connection
db.once('open', () => console.log(`${db.name} database connection has been established successfully.`));

module.exports = db;
