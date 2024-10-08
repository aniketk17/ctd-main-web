const User = require('../models/user.model.js');

const getProfile = async (req, res) => {
    try {
        const userID = req.user.id;
        const user = await User.findByPk(userID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    }
    catch(error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

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
        
        res.status(200).json({ message: 'Profile updated successfully', user });
    }
    catch(error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getProfile, updateProfile };