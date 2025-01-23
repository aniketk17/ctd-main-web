const { where, Op } = require('sequelize');
const Cart = require('../models/cart.model.js');
const User = require('../models/user.model.js');
const Pass = require('../models/pass.model.js');
const Webweaver = require('../models/webweaver.model.js');
const Transaction = require('../models/transaction.model.js');

const eventsArr = ["CLASH", "RC", "DW", "NTH", "CX", "ENIGMA", "WS", "BPLAN", "QUIZ", "XODIA"]

const EventPass = async (req, res) => {
    const currentUser = req.user;
    const { transactionCode } = req.body;

    if (!transactionCode) {
        return res.status(400).json({ message: "Transaction code is required" });
    }

    try {
        const existingPass = await Pass.findOne({ where: { user: currentUser.username } });
        if (existingPass) {
            return res.status(400).json({ message: "You already have a pass" });
        }

        const transaction = await Transaction.findOne({
            where: {
                transaction_code: transactionCode,
            },
        });

        if (transaction) {
            return res.status(400).json({ message: "transaction already exist" });
        }

        const newTransaction = await Transaction.create({
            user: currentUser.username,
            transaction_code: transactionCode,
            events: eventsArr,
            amount: 50,
            is_verified: false,
            is_pass: true
        })

        if(newTransaction) {
            const pass = await Pass.create({
                user: currentUser.username,
            })
            if(pass) {
                return res.status(200).json({ message: "Pass transaction successfull, verification pending" });
            }
        }

    } catch (error) {
        console.error("Error in EventPass:", error);
        res.status(500).json({ message: "Server error", error });
    };
}

const checkPass = async(req, res) => {
    const currentUser = req.user.username;
    try{
        const exisitingPass = await Pass.create({ where: { user: currentUser }});
        if(exisitingPass) {
            return res.status(400).json({ havePass: true } );
        }
        else{
            return res.status(400).json({ havePass: false } );
        }
    }
    catch (error) {
        // console.log("Error in checking Pass")
        res.status(500).json({ message: "Internal Server Error"});
    } 
}
module.exports = { EventPass, checkPass}