const { where, Op } = require('sequelize')
const db = require('../config/db.js')
const Cart = require('../models/cart.model.js');
const User = require('../models/user.model.js');

const checkRegistration = async (req, res) => {
    const { eventName } = req.body;
    const user1 = req.user;
    console.log(user1)

    if (!eventName) {
        return res.status(400).json({ message: "Event name is required." });
    }

    try {

        let existingUser = await Cart.findOne({ where: { user1: user1.username, event_name: eventName } });

        if (existingUser) {
            return res.status(400).json({ message: "User already registered." });
        }

        existingUser = await Cart.findOne({ where: { user2: user1.username, event_name: eventName } });

        if (existingUser) {
            return res.status(400).json({ message: "User already registered." });
        }

        return res.status(201).json({ message: "User not registered, proceed." });

    } catch (error) {
        console.error("Error checking registration:", error);
        return res.status(500).json({ message: "An error occurred while checking registration." });
    }
};

const addCart = async (req, res) => {
    const { username2, eventName } = req.body
    const user1 = req.user

    if (!eventName) {
        return res.status(400).json({ message: "Event name is required." });
    }

    try {

        let cart;
        if (!username2) {
            cart = await Cart.create({
                user1: user1.username,
                user2: null,
                event_name: eventName,
            })
            return res.status(201).json({ message: "event added to cart." })
        }

        const isUser2 = await User.findOne({ where: { username: username2}})
        if( !isUser2 ){
            return res.status(403).json({ message: "user not registered." })
        }

        const existingUser2 = await Cart.findOne({
            where: {
                event_name: eventName,
                [Op.or]: [
                    { user1: username2 },
                    { user2: username2 },
                ],
            }
        })

        if(existingUser2) {
            return res.status(400).json({ message: "User 2 already registered." });
        }

        cart = await Cart.create({
            user1: user1.username,
            user2: username2,
            event_name: eventName,
        })

        return res.status(201).json({ message: "event added to cart." })


    } catch (error) {
        console.error("error while adding to cart: ", error)
        return res.status(500).json({ message: "server error" })
    }
}

module.exports = { checkRegistration, addCart }