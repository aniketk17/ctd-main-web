const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const generateUserId = () => {
    return uuidv4().slice(0, 8);
};

const register = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, enrollmentNumber, password } = req.body;
  
  if (!firstName || !lastName || !email || !phoneNumber || !enrollmentNumber || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS));
    const userId = generateUserId();

    const result = await db.query(
      'INSERT INTO users (user_id, first_name, last_name, email, phone_number, enrollment_number, password, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [userId, firstName, lastName, email, phoneNumber, enrollmentNumber, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(403).json({ message: 'Invalid email or password' });
    }

    const accessToken = jwt.sign({ userId: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

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

const token = (req, res) => {
  // Token refresh logic if needed
};

module.exports = { register, login, logout, token };
