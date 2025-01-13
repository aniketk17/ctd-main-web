const db = require('../config/db.js');
const User = require("./user.model.js");
const { Sequelize, DataTypes } = require("sequelize");

const Webweaver = db.define('Webweaver', {
    user:{
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: User,
            key: 'username',
        }, 
    }
});

module.exports = Webweaver;