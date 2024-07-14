const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const cartController = require('../controllers/cart.controller.js')

router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the dashboard!' });
});

router.post('/check_registration', authenticateToken, cartController.checkRegistration)
router.post('/add_cart', authenticateToken, cartController.addCart)


module.exports = router;
