// models/token.model.js

const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/db'); // Assuming your Sequelize instance is exported from db.js

const Token = db.define('Token', {
    token_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    username1: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username2: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    eventName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    teamName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'tokens',
    timestamps: true,
});

module.exports = Token;
