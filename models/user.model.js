const { Sequelize, DataTypes } = require("sequelize");
const db = require('../config/db.js')

const User = db.define('User', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
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
    is_junior: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    NCC: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    RC: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    NTH: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    Enigma: {                                   
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    DecodeRush: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    otp_expiration: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    tableName: 'users',
    timestamps: true,
});

module.exports = User;
