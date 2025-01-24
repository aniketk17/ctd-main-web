const Cart = require('../models/cart.model.js');
const Transaction = require('../models/transaction.model.js');
const User = require('../models/user.model.js');
const Pass = require('../models/pass.model.js');
const { where, Op } = require('sequelize');

const getProfile = async (req, res) => {
    try {
        const userID = req.user.id;
        const user = await User.findByPk(userID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userDTO = {
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            is_junior: user.is_junior
        }; 

        const allUserEvents = await Cart.findAll({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { user1: user.username },
                            { user2: user.username },
                            { user3: user.username },
                            { user4: user.username }
                        ],
                    },
                    { is_paid: true },
                ],
            },
        });

        const verifiedEvents = [];
        const unverifiedEvents = [];
        for(let i = 0; i < allUserEvents.length; i++) {
            if(allUserEvents[i].is_pending === false) {
                verifiedEvents.push(allUserEvents[i].event_name);
            }
            else{
                unverifiedEvents.push(allUserEvents[i].event_name);
            }
        }

        userDTO["verifiedEvents"] = verifiedEvents; 
        userDTO["unverifiedEvents"] = unverifiedEvents;
        const exisitingPass = await Pass.findOne({ where: { user: user.username }});
        const passTransaction = await Transaction.findOne({ 
            where: {
                [Op.and]: [
                    { user: user.username },
                    { is_pass: true }
                ]
            }
        });
        

        if(exisitingPass) {
            userDTO["have_pass"] = true;
            if(passTransaction.is_verified) {
                userDTO["is_pass_verified"] = true;
            }
            else{
                userDTO["is_pass_verified"] = false;
            }
        }
        else{
            userDTO["have_pass"] = false;
            userDTO["is_pass_verified"] = false;
        }
        res.status(200).json({ user: userDTO });
    }
    catch(error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const updateProfile = async (req, res) => {
    try {
        const userID = req.user.id;
        const { first_name, last_name, phone_number } = req.body;
        const user = await User.findByPk(userID);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user profile
        user.first_name = first_name || user.first_name;
        user.last_name = last_name || user.last_name;
        user.phone_number = phone_number || user.phone_number;

        await user.save();
        const userDTO = {
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            is_junior: user.is_junior
        };

        
        res.status(200).json({ message: 'Profile updated successfully', userDTO });
    }
    catch(error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getProfile, updateProfile };