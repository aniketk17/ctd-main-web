const { Sequelize } = require('sequelize');
const fs = require('fs');
require('dotenv').config();

const { DATABASE_PORT, DATABASE_USERNAME, DATABASE_NAME, DATABASE_PASSWORD, DATABASE_HOST } = process.env

const db = new Sequelize(DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, {
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  dialect: 'postgres',
  logging: false,
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
      ca: process.env.DATABASE_SSL_CA ? process.env.DATABASE_SSL_CA : undefined,
    },
  },
});

module.exports = db;
