const Transaction = require('../models/transaction.model.js');
const Cart = require('../models/cart.model.js');
const { Op } = require('sequelize');

const eventPrices = {
    'NCC': 50,
    'RC': 50,
    'NTH': 0,
    'Enigma': 50,
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
                [Op.or]: [{ user1: currentUser }, { user2: currentUser }],
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
                    [Op.or]: [{ user1: currentUser }, { user2: currentUser }],
                    event_name: { [Op.in]: eventNames } // Update only the events in this transaction
                },
            }
        );

        // Retrieve and return only the cart items that were part of the current transaction
        const updatedCart = await Cart.findAll({
            where: {
                [Op.or]: [{ user1: currentUser }, { user2: currentUser }],
                event_name: { [Op.in]: eventNames } // Return only the updated events
            },
        });

        res.status(200).json({ message: "Transaction submitted, pending verification.", Cart: updatedCart });
    }
    catch (error) {
        console.error("Error submitting transaction:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { submitTransaction };
        