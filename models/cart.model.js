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
        }, 
    },
    user2: {
        type: DataTypes.STRING,
        allowNull: true,
        // defaultValue: null,
        references: {
            model: User,
            key: 'username',
        },
    },
    user3: {
        type: DataTypes.STRING,
        allowNull: true,
        // defaultValue: null,
        references: {
            model: User,
            key: 'username',
        } 
    },
    user4: {
        type: DataTypes.STRING,
        allowNull: true,
        // defaultValue: null,
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
    is_pending:{
        type:DataTypes.BOOLEAN,
        allowNull:true,
        defaultValue:null
    }                                                               
}, {
    tableName: 'carts',
    timestamps: true,
});

// User.hasMany(Cart, { foreignKey: 'user1' });
// User.hasMany(Cart, { foreignKey: 'user2' });
// User.hasMany(Cart, { foreignKey: 'user3' });
// User.hasMany(Cart, { foreignKey: 'user4' });
// Cart.belongsTo(User, { foreignKey: 'user1' });
// Cart.belongsTo(User, { foreignKey: 'user2' });
// Cart.belongsTo(User, { foreignKey: 'user3' });
// Cart.belongsTo(User, { foreignKey: 'user4' });

User.hasMany(Cart, { foreignKey: 'user1', sourceKey: 'username', as: 'user1CartRelations' });
User.hasMany(Cart, { foreignKey: 'user2', sourceKey: 'username', as: 'user2CartRelations' });
User.hasMany(Cart, { foreignKey: 'user3', sourceKey: 'username', as: 'user3CartRelations' });
User.hasMany(Cart, { foreignKey: 'user4', sourceKey: 'username', as: 'user4CartRelations' });

Cart.belongsTo(User, { foreignKey: 'user1', targetKey: 'username', as: 'user1Details' });
Cart.belongsTo(User, { foreignKey: 'user2', targetKey: 'username', as: 'user2Details' });
Cart.belongsTo(User, { foreignKey: 'user3', targetKey: 'username', as: 'user3Details' });
Cart.belongsTo(User, { foreignKey: 'user4', targetKey: 'username', as: 'user4Details' });



module.exports = Cart
