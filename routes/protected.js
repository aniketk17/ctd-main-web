const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the dashboard!' });
});

module.exports = router;
