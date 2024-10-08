const { Transaction } = require('../models/transaction.model.js');
const Cart = require('../models/cart.model.js');
const { Op } = require('sequelize');

// Controller for submitting the transaction
const submitTransaction = async (req, res) => {
    const { transaction_code } = req.body;
    const currentUser = req.user.username;

    if (!transaction_code) {
        return res.status(400).json({ message: "Transaction ID is required." });
    }

    try {
        // Fetch all events in the cart for the current user
        const userCartItems = await Cart.findAll({
            where: {
                [Op.or]: [{ user1: currentUser }, { user2: currentUser }],
                is_paid: false,
            },
        });

        if (userCartItems.length === 0) {
            return res.status(404).json({ message: "No unpaid events found in the cart." });
        }

        // Prepare data to store in the transaction table
        const eventNames = userCartItems.map(item => item.event_name);
        const totalAmount = eventNames.reduce((total, eventName) => total + (eventPrices[eventName] || 0), 0);

        // Save the transaction details in the Transaction table
        await Transaction.create({
            user: currentUser,
            transaction_code,
            events: eventNames,
            amount: totalAmount,
        });

        res.status(200).json({ message: "Transaction submitted, pending verification." });
    } catch (error) {
        console.error("Error submitting transaction:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


module.exports = { submitTransaction };