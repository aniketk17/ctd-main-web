const { where, Op } = require('sequelize');
const Cart = require('../models/cart.model.js');
const User = require('../models/user.model.js');
const Token = require('../models/token.model.js');
const { sendEmail, sendEmail2 } = require('../utils/email.util.js');

// Function to generate a random token 6 digits
function generateRandomToken() {
    return Math.floor(Math.random() * 900000) + 100000;
}


const checkRegistration = async (req, res) => {
    const { eventName } = req.body;
    const user1 = req.user;

    if (!eventName) {
        return res.status(400).json({ message: "Event name is required." });
    }

    try {
        const existingUser = await Cart.findOne({
            where: {
                event_name: eventName,
                [Op.or]: [{ user1: user1.username }, { user2: user1.username }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already registered." });
        }

        return res.status(200).json({ message: "Proceed." });

    } catch (error) {
        console.error("Error checking registration:", error);
        return res.status(500).json({ message: "An error occurred while checking registration." });
    }
};

const addCart = async (req, res) => {
    const { username2, teamName, eventName } = req.body
    const user1 = req.user

    if (!eventName || !teamName) {
        return res.status(400).json({ message: "Incomplete credentials" });
    }

    if (username2 === user1.username) {
        return res.status(400).json({ message: "You cannot team up with yourself." });
    }

    try {
        let cart;  
        if (!username2) {
            const existingUser1 = await Cart.findOne({
                where: {
                    event_name: eventName,
                    [Op.or]: [
                        { user1: user1.username },
                        { user2: user1.username },
                    ]
                }
            });

            if (existingUser1) {
                return res.status(400).json({ message: "You are already registered for this event." });
            }

            cart = await Cart.create({
                user1: user1.username,
                user2: null,
                event_name: eventName,
                team_name: teamName,
            });
            return res.status(201).json({ message: "Event added to cart." });
        }

        const isUser2 = await User.findOne({ where: { username: username2 } })
        if (!isUser2) {
            return res.status(403).json({ message: "One of the user is not registered." })
        }

        const existingUser1OrUser2 = await Cart.findOne({
            where: {
                event_name: eventName,
                [Op.or]: [
                    { user1: user1.username },
                    { user2: user1.username },
                    { user1: username2 },
                    { user2: username2 },
                ]
            }
        });

        if (existingUser1OrUser2) {
            return res.status(400).json({ message: "One of the users is already registered for this event." });
        }

        const confirmationToken = generateRandomToken();

        // Save the token to the database with a timestamp for expiration
        await Token.create({
            token: confirmationToken,
            username1: user1.username,
            username2: username2,
            eventName: eventName,
            teamName: teamName,
            expiresAt: new Date(Date.now() + 6 * 3600 * 1000) // Example: Expires in 6 hours
        });

        const confirmationLink = `http://localhost:3000/protected/confirm_team?token=${confirmationToken}`;

        const emailSubject = "Team Formation Request";
        const emailBody = `
        <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4CAF50;">Team Formation Request</h2>
        <p>Hi <strong>${isUser2.username}</strong>,</p>
        <p><strong>${user1.username}</strong> (<em>${user1.first_name} ${user1.last_name}</em>) wants to team up with you for the event <strong>"${eventName}"</strong>.</p>
        <p>Please click the button below to confirm your team:</p>
        <a href="${confirmationLink}" style="display: inline-bl             ock; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: white; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Confirm Team</a>
        <p>If you did not initiate this request, you can ignore this email.</p>
        <p>Thank you!</p>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <footer style="font-size: 12px; color: #aaa;">
            <p>Event Team, Credenz</p>                  
        </footer>
    </div>
`;

        // Send email to user2 with the confirmation link
        if(confirmationToken % 2 == 0) {
            await sendEmail(isUser2.email, emailSubject, emailBody);
        }
        else {
            await sendEmail2(isUser2.email, emailSubject, emailBody);
        }       

        return res.status(201).json({ message: "Email is sent to your teammate. Please ask them to click on the verification link." })

    } catch (error) {
        console.error("error while adding to cart: ", error)
        return res.status(500).json({ message: "server error" })
    }
}

const confirmTeam = async (req, res) => {
    const { token } = req.query;

    try {
        const tokenEntry = await Token.findOne({ where: { token: token } });

        if(!tokenEntry) {
            return res.status(404).json({ message: "Invalid Token" });
        }

        if (tokenEntry.expiresAt < new Date()) {
            await Token.destroy({ where: { token: token } });
            return res.status(400).json({ message: "Token has expired." });
        }

        // Check if users are already part of a team for the same event
        const existingUser1 = await Cart.findOne({
            where: {
                event_name: tokenEntry.eventName,
                [Op.or]: [
                    { user1: tokenEntry.username1 },
                    { user2: tokenEntry.username1 },
                ],
            }
        });

        if (existingUser1) {
            return res.status(400).json({ message: "One of the members is already registered for this event." });
        }

        const existingUser2 = await Cart.findOne({
            where: {
                event_name: tokenEntry.eventName,
                [Op.or]: [
                    { user1: tokenEntry.username2 },
                    { user2: tokenEntry.username2 },
                ],
            }
        });

        if (existingUser2) {
            return res.status(400).json({ message: "One of the members is already registered for this event." });
        }


        await Cart.create({
            user1: tokenEntry.username1,
            user2: tokenEntry.username2,
            team_name: tokenEntry.teamName,
            event_name: tokenEntry.eventName,
        });

        await Token.destroy({ where: { token: token } });

        return res.status(200).json({ message: "Event added to cart successfully." });
    }
    catch (error) {
        console.log("Error in forming team", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

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
    catch (error) {
        console.error("Error fetching cart items: ", error);
        return  res.status(500).json({ message: "Server Error", error });
    }
}

const deleteCartItem = async (req, res) => {
    const currentUser = req.user.username;
    const eventName = req.params.eventName;

    try {
        // Find the cart item by event name and current user
        const cartItem = await Cart.findOne({
            where: {
                event_name: eventName,
                [Op.or]: [
                    { user1: currentUser },
                    { user2: currentUser }
                ]
            }
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found.' });
        }

        await cartItem.destroy();
        res.status(200).json({ message: 'Event removed from cart' });
    } catch (error) {
        console.error('Error deleting cart item: ', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteCart = async (req, res) => {
    const currentUser = req.user.username;

    try {
        // Find all cart items for the current user
        const cartItems = await Cart.findAll({
            where: {
                [Op.or]: [
                    { user1: currentUser },
                    { user2: currentUser }
                ]
            }
        });

        if (cartItems.length === 0) {
            return res.status(404).json({ message: 'Cart is already empty' });
        }

        // Delete all found cart items
        await Cart.destroy({
            where: {
                [Op.or]: [
                    { user1: currentUser },
                    { user2: currentUser }
                ]
            }
        });

        res.status(200).json({ message: 'Cart deleted successfully' });
    } catch (error) {
        console.error('Error deleting cart:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const myOrders = async (req, res) => {
    try {
        const currentUser = req.user.username;

        // Find all paid orders for the current user
        const paidOrders = await Cart.findAll({
            where: {
                is_paid: true,
                [Op.or]: [
                    { user1: currentUser },
                    { user2: currentUser }
                ],
            }
        });
        console.log(paidOrders);
        return res.status(200).json({ paidOrders });
    } catch (error) {
        console.error('Error fetching paid orders:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {  
                    checkRegistration,
                    addCart,
                    viewCart,
                    deleteCartItem,
                    deleteCart,
                    myOrders,
                    confirmTeam 
                };