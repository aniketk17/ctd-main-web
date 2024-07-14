const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db.js');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user.model.js');
const { Op } = require('sequelize');
const sendEmail = require('../utils/email.util.js')
const crypto = require('crypto')


const generateUserId = () => {
  return uuidv4().slice(0, 8);
};

const register = async (req, res) => {
  const { username, first_name, last_name, email, phone_number, enrollment_number, password } = req.body;

  if (!first_name || !last_name || !email || !username || !phone_number || !enrollment_number || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {


    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email is already taken' });
    }

    const existingUserByUsername = await User.findOne({ where: { username } });
    if (existingUserByUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS));
    //const userId = generateUserId();

    const newUser = await User.create({
      id: uuidv4(),
      username,
      first_name,
      last_name,
      email,
      phone_number,
      enrollment_number,
      password: hashedPassword,
      created_at: new Date(),
    })

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error("error in registering user: ", error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const login = async (req, res) => {
  const { email, username, password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "password field is required." })
  }

  if (!email && !password) {
    return res.status(400).json({ message: "email or username field is required." })
  }


  try {
    const user = await User.findOne({ where: email ? { email } : { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(403).json({ message: 'Invalid crendentials' });
    }

    //jwt expires in 1 day
    //cookie setting refresh once
    const accessToken = jwt.sign({ userId: user.id, email: user.email, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.cookie('jwt', accessToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 24 * 60 * 60 * 1000 });
    res.json({ message: 'Logged in successfully', userId: user.user_id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const logout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 0 });
  res.json({ message: 'Logged out successfully' });
};

//add forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "email field is required." })
  }

  try {
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiration = new Date(Date.now() + process.env.OTP_EXPIRATION * 60000);

    await user.update({ email_otp: otp, otp_expiration: otpExpiration });

    await sendEmail(user.email, 'Password Reset OTP', `Your OTP is: ${otp}`);
    return res.status(200).json({ message: "OTP has been sent to your email." })

  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body


  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }

  try {
    const user = await User.findOne({
      where: {
        email,
        email_otp: otp,
        otp_expiration: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid OTP or OTP expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS));
    await user.update({ password: hashedPassword, otp: null, otpExpiration: null });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


module.exports = { register, login, logout, forgotPassword, resetPassword};
