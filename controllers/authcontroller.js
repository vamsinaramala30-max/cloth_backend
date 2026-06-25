const jwt = require('jsonwebtoken');
const env = require('../src/config/env');
const User = require('../models/user');

const generateTokens = (id, role) => {
  const accessToken = jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: '15m' });
  return { accessToken };
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Identity registration overlap.' });

    const user = await User.create({ name, email, passwordHash: password, isVerified: true });
    const { accessToken } = generateTokens(user._id.toString(), user.role);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production' || env.COOKIE_SECURE,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    return res.status(201).json({ success: true, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid dynamic credentials.' });
    }

    const { accessToken } = generateTokens(user._id.toString(), user.role);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production' || env.COOKIE_SECURE,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    return res.status(200).json({ success: true, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login };