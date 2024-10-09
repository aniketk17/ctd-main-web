const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); // For setting secure HTTP headers
const rateLimit = require('express-rate-limit');
const db = require('./config/db.js');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes.js');
const protectedRoutes = require('./routes/api.routes.js');

const app = express();

app.set('trust proxy', 1);

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: false
}));

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use('/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/protected', protectedRoutes);

const initApp = async () => {
    console.log("Testing the database connection..");

    try {
        await db.authenticate();
        await db.sync({alter:true})
        console.log("Connection has been established successfully.");

    } catch (error) {
        console.error("Unable to connect to the database:", error.original);
    }
}

initApp();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
