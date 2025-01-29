const { where, Op } = require('sequelize');
const Cart = require('../models/cart.model.js');
const User = require('../models/user.model.js');
const { sendEmail, sendEmail2, sendConfirmationEmail } = require('../utils/email.util.js');
const Webweaver = require('../models/webweaver.model.js');
const Pass = require('../models/pass.model.js')

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

        if (eventName === "WW") {
            let existingUser = await Webweaver.findOne({ where: { user: user1.username } });
            if (existingUser) {
                return res.status(400).json({ message: "User already registered." });
            }
        }
        let existingUser = await Cart.findOne({ where: { user1: user1.username, event_name: eventName } });

        if (existingUser) {
            return res.status(400).json({ message: "User already registered."});
        }

        existingUser = await Cart.findOne({ where: { user2: user1.username, event_name: eventName } });

        if (existingUser) {
            return res.status(400).json({ message: "User already registered."});
        }


        return res.status(201).json({ message: "Proceed." });

    } catch (error) {
        console.error("Error checking registration:", error);
        return res.status(500).json({ message: "An error occurred while checking registration." });
    }
};

const addCart = async (req, res) => {
    const { username2, username3, username4, teamName, eventName } = req.body
    const user1 = req.user

    if (!eventName) {
        return res.status(400).json({ message: "Please provide event name" });
    }

    if (username2 && username2 === user1.username && !username3 && !username4) {
        return res.status(400).json({ message: "You cannot team up with yourself" });
    }

    if(username2 && !teamName) {
        return res.status(400).json({ message: "Please provide team name" });
    }

    try {

        if (eventName === "WW") {

            const usernames = [user1.username, username2, username3, username4];
            const uniqueusernames = new Set(usernames);
            if(uniqueusernames.size !== usernames.length) {
                return res.status(400).json({ message: "usernames must be unique"});
            }

            const existingUsers = await User.findAll({
                where: {
                    username: {
                        [Op.in]: usernames
                    }
                }
            });

            const existingUsernames = existingUsers.map(user => user.username);
            const unregisteredUsernames = usernames.filter(username => !existingUsernames.includes(username));
            // console.log(unregisteredUsernames);
            if (unregisteredUsernames.length > 0) {
                const usernamesStr = unregisteredUsernames.join(', ');
                return res.status(400).json({ message: `${usernamesStr} not registered.` });
            }

            const registeredUsers = await Webweaver.findAll({
                where: {
                    [Op.or]: [
                        {user: user1.username},
                        { user: username2 },
                        { user: username3 },
                        { user: username4 }
                    ]
                },
            });

            if (registeredUsers.length > 0) {
                const usernames = registeredUsers.map(user => user.user).join(', ');
                return res.status(400).json({ message: `${usernames} already registered for an event.` });
            }

            const webweaverObjs = await Webweaver.bulkCreate([
                { user: user1.username },
                { user: username2 },
                { user: username3 },
                { user: username4 }
            ]);

            const cart = await Cart.create({
                user1: user1.username,
                user2: username2,
                user3: username3,
                user4: username4,
                event_name: eventName,
                team_name: teamName
            });

            if (cart) {
                return res.status(201).json({ message: "Event added to cart." })
            }
        }

        const existingUser1 = await Cart.findOne({
            where: {
                event_name: eventName,
                [Op.or]: [
                    { user1: user1.username },
                    { user2: user1.username },
                ],
            },
        });
    
        if (existingUser1) {
            return res.status(400).json({ message: `${user1.username} already registered for an event.` });
        }

        if(username2) {
            const isUser2 = await User.findOne({ where: { username: username2 } })
            if (!isUser2) {
                return res.status(404).json({ message: `${username2} not registered.` })
            }

            const existingUser2 = await Cart.findOne({
                where: {
                    event_name: eventName,
                    [Op.or]: [
                        { user1: username2 },
                        { user2: username2 },
                    ],
                },
            });

            if (existingUser2) {
                return res.status(400).json({ message: `${username2} already registered for an event.` });
            }
        }

        const userPass = await Pass.findOne({ where: { user: user1.username }});
        // console.log(userPass);
        let cart;
        if (userPass && eventName !== "ROBOLIGA") {
            cart = await Cart.create({
                user1: user1.username,
                user2: username2,
                event_name: eventName,
                team_name: teamName,
                is_paid: true,
                is_pending: true
            });
            const user2 = await User.findOne({ where: { username: username2 }});
            if(cart){
                await sendConfirmationEmail(user1,[eventName]);
                if(user2) {
                    await sendConfirmationEmail(user2,[eventName]);
                }
            }
            return res.status(201).json({ message: "Event Registration successfull." });

        }
        else {
            cart = await Cart.create({
                user1: user1.username,
                user2: username2,
                event_name: eventName,
                team_name: teamName,
                is_paid: false
            })
        }
        return res.status(201).json({ message: "event added to cart." })

    } catch (error) {
        console.error("error while adding to cart: ", error)
        return res.status(500).json({ message: "server error" })
    }
}

const eventPrices = {
    'CLASH': 50,
    'RC': 50,
    'DW': 50,
    'XODIA': 50,
    'CX': 50,
    'WW': 50,
    'NTH': 0,
    'WS': 50,
    'ENIGMA': 50,
    'BPLAN': 50,
    'QUIZ': 50,
    'ROBOLIGA': 50,
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
                            { user3: currentUser },
                            { user4: currentUser }
                        ],
                    },
                    { is_paid: false },

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
        return res.status(500).json({ message: "Server Error", error });
    }
};

const deleteCartItem = async (req, res) => {
    const currentUser = req.user.username;
    const eventName = req.params.eventName;
    // console.log(eventName);

    try {
        const cartItem = await Cart.findOne({
            where: {
                event_name: eventName,
                [Op.or]: [
                    { user1: currentUser },
                    { user2: currentUser },
                    { user3: currentUser },
                    { user4: currentUser }
                ]
            }
        });

        if (!cartItem || cartItem.is_paid === true) {
            return res.status(404).json({ message: 'Cart item not found.' });
        }

        if (eventName === 'WW') {
            const WWItem = await Webweaver.destroy({
                where: {
                    user: { [Op.in]: [cartItem.user1, cartItem.user2, cartItem.user3, cartItem.user4] }
                }
            })
        }

        await cartItem.destroy();
        res.status(200).json({ message: 'Event removed from cart' });
    }
    catch (error) {
        console.error('Error deleting cart item: ', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteCart = async (req, res) => {
    const currentUser = req.user.username;

    try {
        const cartItems = await Cart.findAll({
            where: {
                [Op.and]: [
                    { is_paid: false },
                    {
                        [Op.or]: [
                            { user1: currentUser },
                            { user2: currentUser },
                            { user3: currentUser },
                            { user4: currentUser }
                        ]
                    }
                ]
            }
        });
        
        if (cartItems.length === 0) {
            return res.status(404).json({ message: 'Cart is already empty' });
        }

        for (let i = 0; i < cartItems.length; i++) {
            if (cartItems[i].event_name === 'WW') {
                const cartItem = cartItems[i];
                const WWItem = await Webweaver.destroy({
                    where: {
                        user: { [Op.in]: [cartItem.user1, cartItem.user2, cartItem.user3, cartItem.user4] }
                    }
                })
                break;
            }
        }

        await Cart.destroy({
            where: {
                [Op.and]: [
                    { is_paid: false },
                    {
                        [Op.or]: [
                            { user1: currentUser },
                            { user2: currentUser },
                            { user3: currentUser },
                            { user4: currentUser }
                        ]
                    }
                ]
            }
        });

        res.status(200).json({ message: 'Cart deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting cart:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const myOrders = async (req, res) => {
    try {
        const currentUser = req.user.username;

        const nonPendingOrders = await Cart.findAll({
            where: {
                is_paid: true,
                is_pending: false,
                [Op.or]: [
                    { user1: currentUser },
                    { user2: currentUser },
                    { user3: currentUser },
                    { user4: currentUser }
                ],
            }
        });
        return res.status(200).json({ nonPendingOrders });
    } catch (error) {
        console.error('Error fetching non-pending orders:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

const mypendingOrders = async (req, res) => {
    try {
        const currentUser = req.user.username;

        const pendingOrders = await Cart.findAll({
            where: {
                is_paid: true,
                is_pending: true,
                [Op.or]: [
                    { user1: currentUser },
                    { user2: currentUser },
                    { user3: currentUser },
                    { user4: currentUser },
                ],
            }
        });

        return res.status(200).json({ pendingOrders });
    }
    catch (error) {
        console.error('Error fetching pending orders:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    addCart,
    viewCart,
    deleteCartItem,
    deleteCart,
    myOrders,  // non-pending orders where is_paid = true
    mypendingOrders,  // pending orders where is_paid = true
    checkRegistration
};





 // const confirmationToken = generateRandomToken();

        // // Save the token to the database with a timestamp for expiration
        // await Token.create({
        //     token: confirmationToken,
        //     username1: user1.username,
        //     username2: username2,
        //     eventName: eventName,
        //     teamName: teamName,
        //     expiresAt: new Date(Date.now() + 6 * 3600 * 1000) // Example: Expires in 6 hours
        // });

        // const confirmationLink = `http://localhost:3000/api/confirm_team?token=${confirmationToken}`;

        // const emailSubject = "Team Formation Request";
        // const emailBody = `
        //     Hi ${isUser2.username},
        //     ${user1.username} (${user1.first_name} ${user1.last_name})wants to team up with you for the event "${eventName}".
        //     Please click "${confirmationLink}" to confirm.
        //     If you did not initiate this request, you can ignore this email.
        //     Thank you!
        // `;

        // // Send email to user2 with the confirmation link
        // if (confirmationToken % 2 == 0) {
        //     await sendEmail(isUser2.email, emailSubject, emailBody);
        // }
        // else {
        //     await sendEmail2(isUser2.email, emailSubject, emailBody);
        // }


// const confirmTeam = async (req, res) => {
//     const { token } = req.query;

//     try {
//         const tokenEntry = await Token.findOne({ where: { token: token } });

//         if (!tokenEntry) {
//             return res.status(404).json({ message: "Invalid Token" });
//         }

//         if (tokenEntry.expiresAt < new Date()) {
//             await Token.destroy({ where: { token: token } });
//             return res.status(400).json({ message: "Token has expired." });
//         }

//         // Check if users are already part of a team for the same event
//         const existingUser1 = await Cart.findOne({
//             where: {
//                 event_name: tokenEntry.eventName,
//                 [Op.or]: [
//                     { user1: tokenEntry.username1 },
//                     { user2: tokenEntry.username1 },
//                 ],
//             }
//         });

//         if (existingUser1) {
//             return res.status(400).json({ message: "User 1 is already registered for this event." });
//         }

//         const existingUser2 = await Cart.findOne({
//             where: {
//                 event_name: tokenEntry.eventName,
//                 [Op.or]: [
//                     { user1: tokenEntry.username2 },
//                     { user2: tokenEntry.username2 },
//                 ],
//             }
//         });

//         if (existingUser2) {
//             return res.status(400).json({ message: "User 2 is already registered for this event." });
//         }


//         await Cart.create({
//             user1: tokenEntry.username1,
//             user2: tokenEntry.username2,
//             team_name: tokenEntry.teamName,
//             event_name: tokenEntry.eventName,
//         });

//         await Token.destroy({ where: { token: token } });

//         return res.status(200).json({ message: "Team is formed successfully" });
//     }
//     catch (error) {
//         console.log("Error in forming team", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// }