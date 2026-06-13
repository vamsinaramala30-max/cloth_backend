'use strict';

const express = require('express');
const { sendOtp, verifyOtp } = require('../controllers/otpcontroller');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Basic rate limiter for OTP endpoints (tune values in env)
const otpLimiter = rateLimit({
  windowMs: Number(process.env.OTP_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.OTP_RATE_LIMIT_PER_WINDOW || 8),
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, message: 'Too many OTP requests, try again later.' },
});

router.post('/send', otpLimiter, sendOtp);
router.post('/verify', otpLimiter, verifyOtp);

module.exports = router;
