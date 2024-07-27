const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware.js');
const paymentController = require('../controllers/payment.controller.js');

router.post('payment/create_order', authenticateToken, paymentController.createOrder);
router.post('payment/verify_order', authenticateToken, paymentController.verifyPayment);