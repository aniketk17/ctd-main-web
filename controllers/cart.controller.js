const { where, Op } = require('sequelize');
const Cart = require('../models/cart.model.js');
const User = require('../models/user.model.js');

    const addCart = async (req, res) => {
        const { username2, teamName, user_id, eventName } = req.body;
        const user1 = req.user;

        if(!eventName) {
            return res.status(400).json({ message: "Incomplete credentials." });
        }

        if(username2 === user1.username || user_id === user1.id) {
            return res.status(400).json({ message: "You cannot team up with yourself." });
        }

        try {
            const existingUser1 = await Cart.findOne({
                where: {
                    event_name: eventName,
                    [Op.or]: [
                        { user1: user1.username },
                        { user2: user1.username },
                    ],
                },
            });

            if(existingUser1) {
                return res.status(400).json({ message: "You are already registered for this event." });
            }

            if(user_id && username2) {
                const isUser2 = await User.findOne({ where: { id: user_id, username: username2 } });
                if (!isUser2) {
                    return res.status(403).json({ message: "The specified teammate is not registered on the website or the provided details are incorrect." });
                }

                const existingUser1OrUser2 = await Cart.findOne({
                    where: {
                        event_name: eventName,
                        [Op.or]: [
                            { user1: user1.username },
                            { user2: user1.username },
                            { user1: username2 },
                            { user2: username2 },
                        ],
                    },
                });

                if(existingUser1OrUser2) {
                    return res.status(400).json({ message: "One of the users is already registered for this event." });
                }
                
                const user2 = await User.findOne({
                    where: { username: username2 }
                });

                const curr_user = await User.findOne({
                    where: { username: user1.username }
                });

                if (curr_user.is_junior !== user2.is_junior) {
                    return res.status(400).json({ message: "Both users must have the same junior or senior status to proceed." });
                }

                await Cart.create({
                    user1: user1.username,
                    user2: username2,
                    event_name: eventName,
                    team_name: teamName,
                });

                return res.status(201).json({ message: "Event added to cart successfully." });
            }
            else if ((!user_id && username2) || (user_id && !username2)) {
                return res.status(400).json({ message: "Please pass both user_id and username fields"});
            }
            await Cart.create({ 
                user1: user1.username,
                event_name: eventName,
                team_name: teamName,
            });

            return res.status(201).json({ message: "Event added to cart successfully." });

        }
        catch(error) {
            console.error("Error while adding to cart:", error);
            return res.status(500).json({ message: "Server error" });
        }
    };


const eventPrices = {
    'NCC': 50,
    'RC': 50,
    'NTH': 0,
    'Enigma': 50,
};


const viewCart = async (req, res) => {
    const currentUser = req.user.username;

    try {
        const allUserEvents = await Cart.findAll({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { user1: currentUser },
                            { user2: currentUser },
                        ],
                    },
                    { is_paid: false }
                ],
            },
        });

        let totalPrice = 0;

        const cartItemsWithPrices = allUserEvents.map(cartItem => {
            const eventName = cartItem.event_name;
            const eventPrice = eventPrices[eventName] || 0;
            totalPrice += eventPrice;
            return {
                eventName: eventName,
                eventPrice: eventPrice
            };
        });

        return res.status(200).json({ cartItems: cartItemsWithPrices, totalPrice: totalPrice });
    }
    catch(error) {
        console.error("Error fetching cart items: ", error);
        return  res.status(500).json({ message: "Server Error", error });
    }
}

const deleteCartItem = async (req, res) => {
    const currentUser = req.user.username;
    const eventName = req.params.eventName;

    try {
        const cartItem = await Cart.findOne({
            where: {
                event_name: eventName,
                [Op.or]: [
                    { user1: currentUser },
                    { user2: currentUser }
                ]
            }
        });     

        if(!cartItem) {
            return res.status(404).json({ message: 'Cart item not found.' });
        }

        await cartItem.destroy();
        res.status(200).json({ message: 'Event removed from cart' });
    }
    catch(error) {
        console.error('Error deleting cart item: ', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteCart = async (req, res) => {
    const currentUser = req.user.username;

    try {
        const cartItems = await Cart.findAll({
            where: {
                [Op.or]: [
                    { user1: currentUser },
                    { user2: currentUser }
                ]
            }
        });

        if(cartItems.length === 0) {
            return res.status(404).json({ message: 'Cart is already empty' });
        }

        await Cart.destroy({
            where: {
                [Op.or]: [
                    { user1: currentUser },
                    { user2: currentUser }
                ]
            }
        });

        res.status(200).json({ message: 'Cart deleted successfully' });
    }
    catch(error) {
        console.error('Error deleting cart:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const myOrders = async (req, res) => {
    try {
        const currentUser = req.user.username;

        const paidOrders = await Cart.findAll({
            where: {
                is_paid: true,
                [Op.or]: [
                    { user1: currentUser },
                    { user2: currentUser }
                ],
            }
        });

        return res.status(200).json({ paidOrders });
    }
    catch(error) {
        console.error('Error fetching paid orders:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
                    addCart,
                    viewCart,
                    deleteCartItem,
                    deleteCart,
                    myOrders,
                };