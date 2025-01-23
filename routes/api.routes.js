const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware.js');
const cartController = require('../controllers/cart.controller.js');
const profileController = require('../controllers/profile.controller.js');
const transactionController = require('../controllers/transaction.controller.js');
const dashboardController = require('../controllers/dashboard.controller.js');
const passController = require('../controllers/pass.controller.js')

// Cart routes
router.post('/add_cart', authenticateToken, cartController.addCart);
router.get('/view_cart', authenticateToken, cartController.viewCart);
router.delete('/delete/:eventName', authenticateToken, cartController.deleteCartItem);
router.delete('/delete_cart', authenticateToken, cartController.deleteCart);

// Order routes
router.get('/my_orders', authenticateToken, cartController.myOrders); // Non-pending orders
router.get('/mypending_orders', authenticateToken, cartController.mypendingOrders); // Pending orders

// Profile routes
router.get('/profile', authenticateToken, profileController.getProfile);
router.patch('/profile', authenticateToken, profileController.updateProfile);

// Transaction routes
router.post('/submitTransaction', authenticateToken, transactionController.submitTransaction);

// pass routes
router.post('/buy_pass', authenticateToken, passController.EventPass)

// Dashboard routes
router.get('/getAllTransactions', authenticateToken, dashboardController.getAllTransactions);
router.post('/verifyTransaction', authenticateToken, dashboardController.verifyTransactionFromDashboard);
router.get('/getEventData/:eventName', authenticateToken, dashboardController.getEventData);
router.post('/register', authenticateToken, dashboardController.register);

module.exports = router;
