const Transaction = require('../models/transaction.model.js');
const Cart = require('../models/cart.model.js');
const User = require('../models/user.model.js')
const { Op } = require('sequelize');
const { sendConfirmationEmail } = require('../utils/email.util.js')

const eventPrices = {
    'CLASH': 50,
    'RC': 50,
    'DW': 50,
    'XODIA': 50,
    'CX': 50,
    'WW': 50,
    'NTH': 0,
    'WS': 50,
    'ENIGMA': 50,
    'BPLAN': 70,
};

const submitTransaction = async (req, res) => {
    const { transaction_code } = req.body;
    const currentUser = req.user.username;

    if (!transaction_code) {
        return res.status(400).json({ message: "Transaction ID is required." });
    }

    try {

        const existingTransaction = await Transaction.findOne({
            where: { transaction_code }
        });

        if (existingTransaction) {
            return res.status(400).json({ message: "Transaction already exists" });
        }

        const userCartItems = await Cart.findAll({
            where: {
                [Op.or]: [{ user1: currentUser }, { user2: currentUser }, { user3: currentUser }, { user4: currentUser }],
                is_paid: false,
            },
        });

        if (userCartItems.length === 0) {
            return res.status(404).json({ message: "No unpaid events in the cart." });
        }

        const eventNames = userCartItems.map(item => item.event_name);
        const totalAmount = eventNames.reduce((total, eventName) => total + (eventPrices[eventName] || 0), 0);

        // Create the new transaction
        await Transaction.create({
            user: currentUser,
            transaction_code,
            events: eventNames,
            amount: totalAmount,
        });

        // Update only the cart items that are part of this transaction
        await Cart.update(
            { is_pending: true, is_paid: true },
            {
                where:
                {
                    [Op.or]: [{ user1: currentUser }, { user2: currentUser }, { user3: currentUser }, { user4: currentUser }],
                    event_name: { [Op.in]: eventNames }
                },
            }
        );

        const updatedCart = await Cart.findAll({
            where: {
                [Op.or]: [
                    { user1: currentUser },
                    { user2: currentUser },
                    { user3: currentUser },
                    { user4: currentUser },
                ],
                event_name: { [Op.in]: eventNames },
            },
        });

        for (let i = 0; i < updatedCart.length; i++) {
            const cartItem = updatedCart[i];
    
            const users = [cartItem.user1, cartItem.user2, cartItem.user3, cartItem.user4];
            for (const username of users) {
                if (username) {
                    const user = await User.findOne({ where: { username } });
                    if (user) {
                        console.log(user.username)
                        await sendConfirmationEmail(user, [cartItem.event_name]);
                    }
                }
            }
        }
        res.status(200).json({ message: "Transaction submitted, pending verification."});
    }
    catch (error) {
        console.error("Error submitting transaction:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { submitTransaction };
