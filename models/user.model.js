const { Sequelize, DataTypes } = require("sequelize");
const db = require('../config/db.js')

// models/User.js

const User = db.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    enrollment_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    isJunior: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = User


