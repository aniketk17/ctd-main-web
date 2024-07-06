const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); // For setting secure HTTP headers
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protected');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CSRF protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Middleware to send CSRF token as a cookie
app.use((req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: false });
    next();
});

app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);

app.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
