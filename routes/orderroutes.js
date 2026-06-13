const express = require('express');
const subRouter = express.Router();
const { authenticate } = require('../../middleware/auth');
const Order = require('../../models/Order');

subRouter.get('/history', authenticate, async (req, res) => {
  try {
    const trackingTree = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: trackingTree });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = subRouter;