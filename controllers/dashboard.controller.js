const Transaction = require('../models/transaction.model.js');


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
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


// Controller to verify a transaction from the dashboard and update the cart
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

        transaction.is_verified = true;
        await transaction.save();

        const events = transaction.events;
        const transactionUser = transaction.user;

        for (const eventName of events) {
            const cartItemForUser1 = await Cart.findOne({
                where: {
                    user1: transactionUser,
                    event_name: eventName,
                }
            });

            if (cartItemForUser1) {
                cartItemForUser1.is_paid = true;
                await cartItemForUser1.save();
            } else {
                const cartItemForUser2 = await Cart.findOne({
                    where: {
                        user2: transactionUser,
                        event_name: eventName,
                    }
                });

                if (cartItemForUser2) {
                    cartItemForUser2.is_paid = true;
                    await cartItemForUser2.save();
                }
            }
        }

        res.status(200).json({ message: "Transaction verified and cart updated successfully." });
    } catch (error) {
        console.error("Error verifying transaction from dashboard:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


module.exports = {
    getAllTransactions,
    verifyTransactionFromDashboard,
};
