require('dotenv').config();
const mongoose = require('mongoose');

const { Schema } = mongoose;
const COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME || 'bitcoin';
const MODEL_NAME = COLLECTION_NAME[0].toUpperCase() + COLLECTION_NAME.slice(1);

// create model(model_name, instance_of_schema, collection_name)
const Bitcoin = mongoose.model(MODEL_NAME, new Schema({
  _id: { // YYYY-MM-DD date format
    type: String,
    minlength: 10,
    maxlength: 10,
    match: /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
}), COLLECTION_NAME);

module.exports = Bitcoin;
