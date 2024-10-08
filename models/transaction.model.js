const { Sequelize, DataTypes } = require("sequelize");
const db = require('../config/db.js');
const User = require("./user.model.js");

const Transaction = db.define('Transaction', {
    transaction_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: User,
            key: 'username',
        }
    },
    transaction_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    events: {
        type: DataTypes.ARRAY(DataTypes.STRING), // This stores event names as an array
        allowNull: false,
    },
    amount: {
        type: DataTypes.INTEGER, // The total amount paid
        allowNull: false,
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Initially false, will change after manual verification
    }
}, {
    tableName: 'transactions',
    timestamps: true,
});

User.hasMany(Transaction, { foreignKey: 'user' });
Transaction.belongsTo(User, { foreignKey: 'user' });

module.exports = Transaction;