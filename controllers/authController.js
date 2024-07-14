const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db.js');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user.models.js');
const { json } = require('sequelize');

const generateUserId = () => {
  return uuidv4().slice(0, 8);
};

const register = async (req, res) => {
  const { username, first_name, last_name, email, phone_number, enrollment_number, password } = req.body;

  if (!first_name || !last_name || !email || !username || !phone_number || !enrollment_number || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {


    const existingUserByEmail = await db.User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email is already taken' });
    }

    const existingUserByUsername = await db.User.findOne({ where: { username } });
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
    return res.status(400).json({ error: "password field is required." })
  }

  if (!email && !password) {
    return res.status(400).json({ error: "email or username field is required." })
  }


  try {
    const user = await User.findOne({ where: email ? { email } : { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(403).json({ message: 'Invalid crendentials' });
    }

    //jwt expires in 1 day
    //cookie setting refresh once
    const accessToken = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

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

module.exports = { register, login, logout };
