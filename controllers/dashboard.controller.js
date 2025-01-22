const Transaction = require('../models/transaction.model.js');
const Cart = require('../models/cart.model.js');
const User = require('../models/user.model.js');
const { Op } = require('sequelize');    

const getAllTransactions = async (req, res) => {
    try {
        // const { status } = req.query;

        let whereClause = {};
        // if (status === 'verified') {
        // whereClause.is_verified = true;
        // } else if (status === 'unverified') {
        whereClause.is_verified = false;    
        // }

        const transactions = await Transaction.findAll({
            where: whereClause,
            order: [['createdAt', 'ASC']],
        });

        res.status(200).json({ transactions });
    }
    catch(error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


const verifyTransactionFromDashboard = async (req, res) => {
    const { transaction_code } = req.body;

    try {
        const transaction = await Transaction.findOne({ where: { transaction_code } });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found." });
        }

        if (transaction.is_verified) {
            return res.status(400).json({ message: "Transaction is already verified." });
        }

        // Mark transaction as verified
        transaction.is_verified = true;
        await transaction.save();

        const events = transaction.events;
        const transactionUser = transaction.user;

        // Loop over each event in the transaction
        for (const eventName of events) {
            try {
                const cartItem = await Cart.findOne({
                    where: {
                        event_name: eventName,
                        [Op.or]: [
                            { user1: transactionUser },
                            { user2: transactionUser },
                            { user3: transactionUser },
                            { user4: transactionUser },
                        ]
                    }
                });
                console.log("cartItem:", cartItem);

                if (cartItem) {
                    cartItem.is_paid = true;
                    cartItem.is_pending = false;
                    await cartItem.save();

                    // const u1 = await User.findOne({ where: { username: cartItem.user1 } });
                    // const u2 = await User.findOne({ where: { username: cartItem.user2 } });

                    // if (u1) {
                    //     u1[eventName] = true;
                    //     await u1.save();
                    // }

                    // if (u2) {
                    //     u2[eventName] = true;              
                    //     await u2.save();
                    // }
                }
            }
            catch (eventError) {
                console.error(`Error processing event ${eventName}:`, eventError);
                return res.status(500).json({ message: `Error processing event ${eventName}`, error: eventError });
            }
        }
        res.status(200).json({ message: "Transaction verified and cart updated successfully." });
    }
    catch (error) {
        console.error("Error verifying transaction from dashboard:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

const getEventData = async (req, res) => {
    const { eventName } = req.params;

    try {
        const participants = await Cart.findAll({
            attributes: ['team_name'],
            where: {
                event_name: eventName,
                is_paid: true,
            },
            include: [
                { model: User, as: 'user1Details', attributes: ['username', 'email', 'first_name', 'last_name', 'phone_number', 'is_junior', 'college_name'] },
                { model: User, as: 'user2Details', attributes: ['username', 'email', 'first_name', 'last_name', 'phone_number', 'is_junior', 'college_name'] },
                { model: User, as: 'user3Details', attributes:['username', 'email', 'first_name', 'last_name', 'phone_number',  'is_junior', 'college_name'] },
                { model: User, as: 'user4Details', attributes: ['username', 'email', 'first_name', 'last_name', 'phone_number', 'is_junior', 'college_name'] },
            ],
        });

        res.status(200).json({ participants });
    } catch (error) {
        console.error('Error fetching event data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const register = async(req, res) => {
    // const {}
};

module.exports = {
    getAllTransactions,
    verifyTransactionFromDashboard,
    getEventData,

};
