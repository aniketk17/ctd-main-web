const { where, Op } = require('sequelize')
const db = require('../config/db.js')
const Cart = require('../models/cart.model.js');
const User = require('../models/user.model.js');

const checkRegistration = async (req, res) => {
    const { eventName } = req.body;
    const user1 = req.user;
    console.log(user1)

    if (!eventName) {
        return res.status(400).json({ message: "Event name is required." });
    }

    try {

        let existingUser = await Cart.findOne({ where: { user1: user1.username, event_name: eventName } });

        if (existingUser) {
            return res.status(400).json({ message: "User already registered." });
        }

        existingUser = await Cart.findOne({ where: { user2: user1.username, event_name: eventName } });

        if (existingUser) {
            return res.status(400).json({ message: "User already registered." });
        }

        return res.status(201).json({ message: "User not registered, proceed." });

    } catch (error) {
        console.error("Error checking registration:", error);
        return res.status(500).json({ message: "An error occurred while checking registration." });
    }
};

const addCart = async (req, res) => {
    const { username2, eventName } = req.body
    const user1 = req.user

    if (!eventName) {
        return res.status(400).json({ message: "Event name is required." });
    }

    try {

        let cart;
        if (!username2) {
            cart = await Cart.create({
                user1: user1.username,
                user2: null,
                event_name: eventName,
            })
            return res.status(201).json({ message: "event added to cart." })
        }

        const isUser2 = await User.findOne({ where: { username: username2 } })
        if (!isUser2) {
            return res.status(403).json({ message: "user not registered." })
        }

        const existingUser2 = await Cart.findOne({
            where: {
                event_name: eventName,
                [Op.or]: [
                    { user1: username2 },
                    { user2: username2 },
                ],
            }
        })

        if (existingUser2) {
            return res.status(400).json({ message: "User 2 already registered." });
        }

        cart = await Cart.create({
            user1: user1.username,
            user2: username2,
            event_name: eventName,
        })

        return res.status(201).json({ message: "event added to cart." })


    } catch (error) {
        console.error("error while adding to cart: ", error)
        return res.status(500).json({ message: "server error" })
    }
}

const eventPrices = {
    'NCC': 50,
    'RC': 50,
    'NTH': 0
};

const viewCart = async (req, res) => {
    const currentUser = req.user.username;

    try {
        const allUserEvents = await Cart.findAll({
            where: {
                [Op.or]: [
                    {user1: currentUser},
                    {user2: currentUser},
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

        res.status(200).json({ cartItems: cartItemsWithPrices, totalPrice: totalPrice });
    }
    catch (error) {
        console.error("Error fetching cart items: ", error);
        res.status(500).json({ message: "Server Error", error });        
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
        return res.status(404).json({ message: 'Cart item not found, ERROR' });
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

module.exports = { checkRegistration, addCart, viewCart, deleteCartItem, deleteCart };