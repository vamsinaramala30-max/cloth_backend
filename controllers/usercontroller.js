const User = require('../models/user');
const jwt = require('jsonwebtoken');


const getMe = async (req, res) => {
  try {
    const { userId } = req.user || {};
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user || {};
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    return res.status(200).json({
      success: true,
      message: 'Profile updated',
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const { userId } = req.user || {};
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { label, street, city, state, postalCode, country, isDefault } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({
      label,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Address added',
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie('accessToken');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMe, updateProfile, addAddress, logout };
