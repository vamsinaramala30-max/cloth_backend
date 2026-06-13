const Stripe = require('stripe');
const env = require('../src/config/env');
const Order = require('../models/Order');
const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

const createCheckoutSession = async (req, res) => {
  try {
    const { items, shippingAddress, financials } = req.body;
    if (!req.user) return res.status(403).json({ success: false, message: 'Context validation missed.' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(financials.total * 100), // convert to cents
      currency: 'usd',
      metadata: { userId: req.user.id },
      automatic_payment_methods: { enabled: true }
    });

    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      paymentInfo: { gateway: 'stripe', paymentId: paymentIntent.id, status: 'pending' },
      financials,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });

    return res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret, orderId: order._id });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createCheckoutSession };