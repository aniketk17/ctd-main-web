const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware.js');
const cartController = require('../controllers/cart.controller.js');
const profileController = require('../controllers/profile.controller.js');

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get the dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Welcome to the dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the dashboard!' });
});

/**
 * @swagger
 * /check_registration:
 *   post:
 *     summary: Check user registration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Registration checked
 */
router.post('/check_registration', authenticateToken, cartController.checkRegistration);

/**
 * @swagger
 * /add_cart:
 *   post:
 *     summary: Add an item to the cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Item added to cart
 */
router.post('/add_cart', authenticateToken, cartController.addCart);

/**
 * @swagger
 * /view_cart:
 *   get:
 *     summary: View cart items
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart viewed
 */
router.get('/view_cart', authenticateToken, cartController.viewCart);

/**
 * @swagger
 * /delete/{eventName}:
 *   post:
 *     summary: Delete an item from the cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventName
 *         schema:
 *           type: string
 *         required: true
 *         description: Event name to delete
 *     responses:
 *       200:
 *         description: Item deleted
 */
router.post('/delete/:eventName', authenticateToken, cartController.deleteCartItem);

/**
 * @swagger
 * /delete_cart:
 *   post:
 *     summary: Delete all items from the cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart deleted
 */
router.post('/delete_cart', authenticateToken, cartController.deleteCart);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile information
 */
router.get('/profile', authenticateToken, profileController.getProfile);

/**
 * @swagger
 * /profile:
 *   patch:
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch('/profile', authenticateToken, profileController.updateProfile);

/**
 * @swagger
 * /my_orders:
 *   get:
 *     summary: Get user's orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's orders retrieved
 */
router.get('/my_orders', authenticateToken, cartController.myOrders);

/**
 * @swagger
 * /confirm_team:
 *   get:
 *     summary: Confirm the user's team
 *     responses:
 *       200:
 *         description: Team confirmed
 */
router.get('/confirm_team', cartController.confirmTeam);

module.exports = router;
