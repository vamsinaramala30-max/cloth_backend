'use strict';

const User = require('../models/user');
const { generateNumericOtp, hashOtp, verifyOtpHash, sendEmailOtp, sendSmsOtp, OTP_TTL_MINUTES } = require('../utils/otpService');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');
const rateLimit = require('express-rate-limit');

// Simple in-memory attempt counter (for demo); recommend Redis for production.
const attempts = new Map();
function increaseAttempts(key) {
  const cur = attempts.get(key) || 0;
  attempts.set(key, cur + 1);
}

async function sendOtp(req, res) {
  try {
    const { email, phone, action } = req.body || {};
    if (!email && !phone) return res.status(400).json({ success: false, message: 'email or phone required' });

    // Rate-limit per email/phone
    const key = email || phone;
    const nowAttempts = attempts.get(key) || 0;
    if (nowAttempts > (Number(process.env.OTP_RATE_LIMIT_ATTEMPTS || 10))) {
      return res.status(429).json({ success: false, message: 'Too many OTP requests' });
    }

    increaseAttempts(key);

    const otp = generateNumericOtp();
    const hashed = await hashOtp(otp);
    const expiry = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // Attach to user (email flow). For phone-only flows you may need phone on User schema.
    let user = null;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user && action === 'register') {
        user = await User.create({ name: email.split('@')[0], email: email.toLowerCase(), isVerified: false });
      }
    }

    if (!user && phone) {
      // Phone OTP requires phone field in user model; if not present, we still return success (stateless flow).
      // To persist phone OTP to user record, add `phone` to `User` schema.
    }

    if (user) {
      user.verificationOtp = hashed; // store hashed
      user.otpExpiry = expiry;
      await user.save();
    }

    // Delivery
    if (email) {
      const subject = 'Your RARE RAB IT verification code';
      const text = `Your verification code is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`;
      await sendEmailOtp({ toEmail: email, subject, text, html: `<p>${text}</p>` });
    } else if (phone) {
      const text = `Your RARE RAB IT code: ${otp}. Expires in ${OTP_TTL_MINUTES}m.`;
      await sendSmsOtp({ toPhone: phone, text });
    }

    return res.status(200).json({ success: true, message: 'OTP sent (masked).', expiresInMinutes: OTP_TTL_MINUTES });
  } catch (err) {
    console.error('[otpcontroller.sendOtp] ', err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
}

async function verifyOtp(req, res) {
  try {
    const { email, phone, otp } = req.body || {};
    if (!otp || (!email && !phone)) return res.status(400).json({ success: false, message: 'otp and email/phone required' });

    let user = null;
    if (email) user = await User.findOne({ email: email.toLowerCase() });
    // For phone flows you must persist phone field on user to find the record.

    if (!user || !user.verificationOtp || !user.otpExpiry) {
      return res.status(400).json({ success: false, message: 'No pending OTP for this account' });
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    const ok = await verifyOtpHash(otp, user.verificationOtp);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    // Mark verified and clear OTP
    user.isVerified = true;
    user.verificationOtp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Issue access token cookie (mirror existing authcontroller pattern)
    const token = jwt.sign({ id: user._id.toString(), role: user.role }, env.JWT_SECRET, { expiresIn: '15m' });
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production' || env.COOKIE_SECURE,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ success: true, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[otpcontroller.verifyOtp] ', err);
    return res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
}

module.exports = { sendOtp, verifyOtp };
