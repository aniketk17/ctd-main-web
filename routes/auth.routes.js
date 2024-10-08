const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot_password', authController.forgotPassword);
router.post('/reset_password', authController.resetPassword);

module.exports = router;