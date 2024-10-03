const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware.js');
const paymentController = require('../controllers/payment.controller.js');

/**
 * @swagger
 * /payment/create_order:
 *   post:
 *     summary: Create a new payment order
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []  # Indicates this route requires authentication (JWT)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *               currency:
 *                 type: string
 *                 example: "USD"
 *     responses:
 *       200:
 *         description: Payment order created successfully
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */
router.post('payment/create_order', authenticateToken, paymentController.createOrder);

/**
 * @swagger
 * /payment/verify_order:
 *   post:
 *     summary: Verify the payment order
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []  # Indicates this route requires authentication (JWT)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "order_xyz123"
 *               paymentId:
 *                 type: string
 *                 example: "payment_abc456"
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       400:
 *         description: Invalid payment details
 *       500:
 *         description: Server error
 */
router.post('payment/verify_order', authenticateToken, paymentController.verifyPayment);