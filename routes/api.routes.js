const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware.js');
const cartController = require('../controllers/cart.controller.js');
const profileController = require('../controllers/profile.controller.js');
const transactionController = require('../controllers/transaction.controller.js');
const dashboardController = require('../controllers/dashboard.controller.js');

router.post('/add_cart', authenticateToken, cartController.addCart);
router.get('/view_cart', authenticateToken, cartController.viewCart);
router.post('/delete/:eventName', authenticateToken, cartController.deleteCartItem);
router.post('/delete_cart', authenticateToken, cartController.deleteCart);
router.get('/my_orders', authenticateToken, cartController.myOrders);
    
router.get('/profile', authenticateToken, profileController.getProfile);
router.patch('/profile', authenticateToken, profileController.updateProfile);

router.post('/submitTransaction', authenticateToken, transactionController.submitTransaction);

router.get('/getAllTransactions', authenticateToken, dashboardController.getAllTransactions);
router.post('/verifyTransaction', authenticateToken, dashboardController.verifyTransactionFromDashboard);  

module.exports = router;
