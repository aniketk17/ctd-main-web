const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Pass = sequelize.define('Pass', {
    user: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    purchased_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false,
});

module.exports = Pass;
