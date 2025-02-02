const Transaction = require("../models/transaction.model.js");
const Cart = require("../models/cart.model.js");
const User = require("../models/user.model.js");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const { sendEmail3 } = require("../utils/email.util.js");
const bcrypt = require("bcrypt");

const generateUserId = () => {
    return uuidv4().slice(0, 8);
};

const eventPrices = {
    CLASH: 50,
    RC: 50,
    DW: 50,
    XODIA: 50,
    CX: 50,
    WW: 50,
    NTH: 0,
    WS: 50,
    ENIGMA: 50,
    BPLAN: 50,
    QUIZ: 50,
    ROBOLIGA: 50,
};

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
            order: [["createdAt", "ASC"]],
        });

        res.status(200).json({ transactions });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

const verifyTransactionFromDashboard = async (req, res) => {
    const { transaction_code } = req.body;

    try {
        const transaction = await Transaction.findOne({
            where: { transaction_code },
        });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found." });
        }

        if (transaction.is_verified) {
            return res
                .status(400)
                .json({ message: "Transaction is already verified." });
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
                        ],
                    },
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
            } catch (eventError) {
                console.error(
                    `Error processing event ${eventName}:`,
                    eventError,
                );
                return res.status(500).json({
                    message: `Error processing event ${eventName}`,
                    error: eventError,
                });
            }
        }
        res.status(200).json({
            message: "Transaction verified and cart updated successfully.",
        });
    } catch (error) {
        console.error("Error verifying transaction from dashboard:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

const getEventData = async (req, res) => {
    const { eventName } = req.params;

    try {
        const participants = await Cart.findAll({
            attributes: ["team_name"],
            where: {
                event_name: eventName,
                is_paid: true,
            },
            include: [
                {
                    model: User,
                    as: "user1Details",
                    attributes: [
                        "username",
                        "email",
                        "first_name",
                        "last_name",
                        "phone_number",
                        "is_junior",
                        "college_name",
                    ],
                },
                {
                    model: User,
                    as: "user2Details",
                    attributes: [
                        "username",
                        "email",
                        "first_name",
                        "last_name",
                        "phone_number",
                        "is_junior",
                        "college_name",
                    ],
                },
                {
                    model: User,
                    as: "user3Details",
                    attributes: [
                        "username",
                        "email",
                        "first_name",
                        "last_name",
                        "phone_number",
                        "is_junior",
                        "college_name",
                    ],
                },
                {
                    model: User,
                    as: "user4Details",
                    attributes: [
                        "username",
                        "email",
                        "first_name",
                        "last_name",
                        "phone_number",
                        "is_junior",
                        "college_name",
                    ],
                },
            ],
        });

        res.status(200).json({ participants });
    } catch (error) {
        console.error("Error fetching event data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const register = async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        phone_number,
        college_name,
        is_junior,
    } = req.body;

    if (!first_name || !last_name || !email || !phone_number) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const userId = generateUserId();
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: "Email already registered" });
        }
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        const username = `${first_name.toLowerCase()}${last_name.toLowerCase()}${randomNumber}`;
        const rawPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(
            rawPassword,
            parseInt(process.env.BCRYPT_SALT_ROUNDS),
        );

        const newUser = await User.create({
            id: userId,
            username,
            first_name,
            last_name,
            email,
            phone_number,
            is_junior,
            college_name: college_name || "PICT",
            password: hashedPassword,
            created_at: new Date(),
        });

        const userDTO = {
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            phone_number: newUser.phone_number,
            is_junior: newUser.is_junior,
        };

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                <p style="font-size: 16px; color: #333;">Dear <strong>${first_name} ${last_name}</strong>,</p>
                <p style="font-size: 16px; color: #333;">
                    Thank you for registering with us! Your account has been successfully created. Below are your login credentials:
                </p>
                <div style="background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin: 20px 0;">
                    <p style="font-size: 16px; margin: 5px 0;"><strong>Username:</strong> ${username}</p>
                    <p style="font-size: 16px; margin: 5px 0;"><strong>Password:</strong> ${rawPassword}</p>
                </div>
                <p style="font-size: 16px; color: #333;">
                    Please keep your credentials safe and do not share them with anyone. You can log in to your account by visiting 
                    <a href="https://www.credenz.co.in" target="_blank">credenz.co.in</a>.
                </p>

                <p style="font-size: 16px; color: #333;">
                    If you have any questions or need assistance, feel free to reach out to our support team.
                </p>
                <p style="font-size: 16px; color: #333;">Best regards,<br>Team Credenz'25</p>
            </div>
        `;

        await sendEmail3(newUser.email, "Login Credentials", emailHtml);
        return res.status(200).json({
            message:
                "User Registration Successfull, login credentials has been sent to the user email",
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

const registerEvent = async (req, res) => {
    const {
        team_name,
        username1,
        username2,
        username3,
        username4,
        eventName,
        transaction_code,
    } = req.body;

    if (!Array.isArray(eventName) || eventName.length === 0) {
        return res.status(404).json({ message: "Please provide eventName." });
    }

    if (!transaction_code) {
        return res.status(400).json({ message: "Transaction ID is required." });
    }

    try {
        const transaction = await Transaction.findOne({
            where: { transaction_code },
        });

        if (transaction) {
            return res
                .status(404)
                .json({ message: "Transaction already exist" });
        }

        const usernames = [username1, username2, username3, username4].filter(
            (username) => username !== null,
        );

        if (usernames.length === 0) {
            return res
                .status(400)
                .json({ message: "At least one valid username is required" });
        }

        const users = await User.findAll({
            where: {
                username: { [Op.in]: usernames },
            },
        });

        if (users.length !== usernames.length) {
            return res
                .status(404)
                .json({ message: "One or more provided users do not exist." });
        }

        const normalizedEventNames = eventName.map((event) =>
            event.toUpperCase(),
        );

        const existingRegistrations = await Cart.findAll({
            where: {
                event_name: { [Op.in]: normalizedEventNames },
                [Op.or]: [
                    { user1: { [Op.in]: usernames } },
                    { user2: { [Op.in]: usernames } },
                    { user3: { [Op.in]: usernames } },
                    { user4: { [Op.in]: usernames } },
                ],
                is_paid: true,
            },
        });

        if (existingRegistrations.length > 0) {
            return res.status(400).json({
                message:
                    "One or more provided users already register for given events",
            });
        }

        const WWIndex = normalizedEventNames.findIndex(
            (event) => event === "WW",
        );
        const totalAmount = normalizedEventNames.reduce(
            (total, eventName) => total + (eventPrices[eventName] || 0),
            0,
        );

        if (WWIndex !== -1 && users.length === 4) {
            await Cart.create({
                team_name: team_name,
                user1: username1,
                user2: username2,
                user3: username3,
                user4: username4,
                eventName: "WW",
                is_paid: true,
                is_pending: true,
            });
            normalizedEventNames.splice(WWIndex, 1);
        } else {
            return res
                .status(400)
                .json({ message: "4 users are required for webweaver." });
        }

        for (let i = 0; i < normalizedEventNames.length; i++) {
            if (!username2) {
                await Cart.create({
                    user1: username1,
                    eventName: normalizedEventNames[i],
                    is_paid: true,
                    is_pending: true,
                });
            } else {
                if (!team_name || team_name.trim() === "") {
                    return res
                        .status(400)
                        .json({ message: "Please provide a team name." });
                }

                await Cart.create({
                    team_name: team_name,
                    user1: username1,
                    user2: username2,
                    eventName: normalizedEventNames[i],
                    is_paid: true,
                    is_pending: true,
                });
            }
        }

        const newTransaction = await Transaction.create({
            user: username1,
            transaction_code,
            events: normalizedEventNames,
            amount: totalAmount,
        });

        return res
            .status(200)
            .json({ message: "Events Registration successfull" });
    } catch (error) {
        return res.status(501).json({ message: "Internal Sever Error" });
    }
};
module.exports = {
    getAllTransactions,
    verifyTransactionFromDashboard,
    getEventData,
    register,
    registerEvent,
};
