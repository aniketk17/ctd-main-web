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
    is_junior: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    otp_expiration: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    college_name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "PICT"
    },
    profile_pic:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate:{
            min: 0,
            max: 10
        }
    }
}, {
    tableName: 'users',
    timestamps: true,
});

module.exports = User;
