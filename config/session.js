const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

const signAccessToken = (userId, userRole) => {
  return jwt.sign(
    { id: userId, role: userRole }, 
    env.JWT_SECRET, 
    { expiresIn: '30m', algorithm: 'HS256' }
  );
};

const sendSecureCookie = (res, token) => {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production' || env.COOKIE_SECURE,
    sameSite: 'None', // Fully cross-origin safe structure
    maxAge: 30 * 60 * 1000 // 30 Minute Temporal Range
  });
};

module.exports = { signAccessToken, sendSecureCookie };