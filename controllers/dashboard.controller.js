const Transaction = require('../models/transaction.model.js');
const Cart = require('../models/cart.model.js');
const User = require('../models/user.model.js');

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
                            { user2: transactionUser }
                        ]
                    }
                });

                if (cartItem) {
                    cartItem.is_paid = true;

                    const u1 = await User.findOne({ where: { username: cartItem.user1 } });
                    const u2 = await User.findOne({ where: { username: cartItem.user2 } });

                    if (u1) u1.eventName = true;
                    if (u2) u2.eventName = true;

                    await cartItem.save();
                    if (u1) await u1.save();
                    if (u2) await u2.save();
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



module.exports = {
    getAllTransactions,
    verifyTransactionFromDashboard,
};
