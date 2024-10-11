const { Sequelize, DataTypes } = require("sequelize");
const db = require('../config/db.js');
const User = require("./user.model.js");

const Cart = db.define('Cart', {
    cart_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user1: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: User,
            key: 'username',
        }
    },
    user2: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: User,
            key: 'username',
        }
    },
    event_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    team_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
}, {
    tableName: 'carts',
    timestamps: true,
});

User.hasMany(Cart, { foreignKey: 'user1' });
User.hasMany(Cart, { foreignKey: 'user2' });
Cart.belongsTo(User, { foreignKey: 'user1' });
Cart.belongsTo(User, { foreignKey: 'user2' });

module.exports = Cart
