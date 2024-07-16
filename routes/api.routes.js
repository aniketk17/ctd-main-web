const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware.js');
const cartController = require('../controllers/cart.controller.js');
const profileController = require('../controllers/profile.controller.js');

router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the dashboard!' });
});

router.post('/check_registration', authenticateToken, cartController.checkRegistration);
router.post('/add_cart', authenticateToken, cartController.addCart);
router.get('/view_cart', authenticateToken, cartController.viewCart);
router.post('/delete/:eventName', authenticateToken, cartController.deleteCartItem);
router.post('/delete_cart', authenticateToken, cartController.deleteCart);
router.get('/profile', authenticateToken, profileController.getProfile);
router.patch('/profile', authenticateToken, profileController.updateProfile);

module.exports = router;
