const razorpay = require('razorpay')
const { v4: uuidv4 } = require('uuid');
const { getProfile, updateProfile } = require('../controllers/profile.controller');
require('dotenv').config();

const razorpay = new razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
})

const createOrder = async (req, res) => {
    try {
        const options = {
            amount: req.body.amount,
            currency: 'INR',
            receipt: 'receipt_' + uuidv4(),
        };

        if (!options.amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }
        const order = await razorpay.orders.create(options);
        console.log(order);
        return res.status(200).json({ message: order });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
}

const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: 'All field are required' })
    }

    try {
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            console.log('Payment verified successfully')
            return res.status(200).json({ message: 'Payment verified successfully' });
        } else {
            console.log('Invalid payment signature')
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

    } catch (error) {
        return res.status(400).json({ error: 'Server error' });
    }
}

module.exports = { createOrder, verifyPayment}