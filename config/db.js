const { Sequelize } = require('sequelize');
require('dotenv').config();

const { DATABASE_PORT, DATABASE_USERNAME, DATABASE_NAME, DATABASE_PASSWORD, DATABASE_HOST } = process.env

const db = new Sequelize(DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, {
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  dialect: 'postgres', 
  //protocol: 'postgres',
  logging: false,
});

module.exports = db;
