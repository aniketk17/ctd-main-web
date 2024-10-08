const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware.js');
const cartController = require('../controllers/cart.controller.js');
const profileController = require('../controllers/profile.controller.js');
const transactionController = require('../controllers/transaction.controller.js');

router.post('/check_registration', authenticateToken, cartController.checkRegistration);
router.post('/add_cart', authenticateToken, cartController.addCart);
router.get('/view_cart', authenticateToken, cartController.viewCart);
router.post('/delete/:eventName', authenticateToken, cartController.deleteCartItem);
router.post('/delete_cart', authenticateToken, cartController.deleteCart);
router.get('/my_orders', authenticateToken, cartController.myOrders);
router.get('/confirm_team', cartController.confirmTeam);

router.get('/profile', authenticateToken, profileController.getProfile);
router.patch('/profile', authenticateToken, profileController.updateProfile);

router.post('/submitTransaction', authenticateToken, transactionController.submitTransaction);
router.post('/verifyTransaction', authenticateToken, transactionController.verifyTransaction);

module.exports = router;
