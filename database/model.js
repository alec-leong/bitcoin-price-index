const { DataTypes, Model } = require('sequelize');
const sequelize = require('./index.js');

class Bitcoin extends Model {}

Bitcoin.init({
  // Model attributes are defined here
  date: {
    type: DataTypes.DATEONLY, // A date only column (no timestamp).
    primaryKey: true, // 'date' attribute as primary key.
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: false, // 'price' attribute will have a NOT NULL constraint.
  },
}, {
  // Other model options go here
  sequelize, // Define the sequelize instance to attach to the new Model.
  modelName: 'Bitcoin', // Set name of the model.
  freezeTableName: true, // Sequelize will not try to alter the model name to get the table name.
  tableName: 'bitcoin', // Set name of the table.
  timestamps: false, // Do not add createdAt and updatedAt timestamps to the model.
});

module.exports = Bitcoin;
