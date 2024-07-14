const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const cart = require('../controllers/cart.controller.js')

router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the dashboard!' });
});

router.post('/check_registration', authenticateToken, cart.checkRegistration)
router.post('/add_cart', authenticateToken, cart.addCart)

module.exports = router;
