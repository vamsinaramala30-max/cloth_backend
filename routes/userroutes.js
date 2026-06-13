const express = require('express');
const subRouter = express.Router();
const { authenticate } = require('../../middleware/auth');
const User = require('../../models/User');

subRouter.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = subRouter;