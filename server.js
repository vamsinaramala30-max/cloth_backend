const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();


// Allow backend to start in degraded mode (no MongoDB) for local dev.
// Use env validation module for real/placeholder defaults.
require('./src/config/env');



const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount new additive auth routes (OTP + session management)
try {
    const otpRoutes = require('./routes/otp.routes');
    const sessionRoutes = require('./routes/session.routes');
    app.use('/api/auth/otp', otpRoutes);
    app.use('/api/auth/session', sessionRoutes);
    const subscriberRoutes = require('./routes/subscriber.routes');
    app.use('/api/subscriber', subscriberRoutes);
} catch (err) {
    console.warn('Optional auth routes not mounted:', err?.message || err);
}


const connectDatabase = require('./config/db');

(async () => {
    try {
        await connectDatabase();
        console.log("Database connection established successfully.");
    } catch (err) {
        console.error("Database connection failure:", err?.message || err);
        process.exit(1);
    }
})();



const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General" }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Use shared User model (keeps schema centralized and backward-compatible)
const User = require('./models/user');


app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Missing identity inputs." });

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) return res.status(400).json({ error: "Email is already registered." });

        const displayName = name || (email.includes('@') ? email.split('@')[0] : email);
        const hashedPassword = password; // model pre-save will hash `passwordHash` field

        const newUser = new User({ email: email.toLowerCase(), name: displayName, passwordHash: hashedPassword });
        await newUser.save();

        res.status(201).json({ success: true, message: "User registered successfully." });
    } catch (err) {
        console.error('[register] ', err);
        res.status(500).json({ error: "Internal server registry error." });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ error: "Invalid login credentials." });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ error: "Invalid login credentials." });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        const isCookieSecure = process.env.COOKIE_SECURE === 'true';

        res.json({
            success: true,
            token,
            user: { id: user._id, email: user.email },
            secureFlag: isCookieSecure
        });
    } catch (err) {
        console.error('[login] ', err);
        res.status(500).json({ error: "Authentication system failure." });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Could not retrieve the product catalog." });
    }
});

app.post('/api/admin/upload', async (req, res) => {
    try {
        const { fileStr } = req.body;
        if (!fileStr) return res.status(400).json({ error: "No image file provided." });

        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            folder: 'aura_luxury_maison',
            resource_type: 'auto'
        });

        res.json({ success: true, url: uploadResponse.secure_url });
    } catch (err) {
        res.status(500).json({ error: "Media parsing pipeline failed." });
    }
});


app.post('/api/payment/stripe', async (req, res) => {
    try {
        const { totalAmount } = req.body;
        if (!totalAmount || totalAmount <= 0) return res.status(400).json({ error: "Invalid payment amount processing threshold." });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'usd',
            automatic_payment_methods: { enabled: true }
        });

        res.json({ success: true, clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['stripe-signature'];
    let transactionEvent;

    try {
        transactionEvent = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook Signature Match Failed: ${err.message}`);
        return res.status(400).send(`Webhook Validation Error: ${err.message}`);
    }

    if (transactionEvent.type === 'payment_intent.succeeded') {
        const payloadData = transactionEvent.data.object;
        console.log(`Payment confirmed for Charge Amount ID: ${payloadData.id}. Fulfilling transaction.`);
    }

    res.json({ received: true });
});

// Mount modular API router (cart/wishlist/orders/payment, etc.)
// Additive only: keeps existing standalone endpoints working.
try {
  const apiRouter = require('./routes/index');
  app.use('/api', apiRouter);
} catch (err) {
  console.warn('Optional modular /api router not mounted:', err?.message || err);
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`[AURA CORE] Server executing smoothly on active port: ${PORT}`));
