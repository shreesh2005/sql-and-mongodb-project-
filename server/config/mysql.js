const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'tata_supply_chain',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Turn off query logs in console, set to console.log to debug
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: false, // Match original SQL schema structure
      freezeTableName: true // Match original table names exactly
    }
  }
);

const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the MySQL database:', error.message);
  }
};

module.exports = { sequelize, connectMySQL };
