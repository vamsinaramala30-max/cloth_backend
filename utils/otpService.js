'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Configurable via env
const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);
const BCRYPT_SALT_ROUNDS = 12;

function generateNumericOtp(length = OTP_LENGTH) {
  const max = 10 ** length;
  const n = crypto.randomInt(0, max);
  return String(n).padStart(length, '0');
}

async function hashOtp(otp) {
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(otp, salt);
}

async function verifyOtpHash(otp, hash) {
  return bcrypt.compare(otp, hash);
}

// Placeholder send hooks - implement provider wiring in your env
async function sendEmailOtp({ toEmail, subject, html, text }) {
  // TODO: integrate SendGrid / Mailgun / SES here.
  // Example: use @sendgrid/mail send() with API key from env.
  console.log('[otpService] sendEmailOtp ->', { toEmail, subject });
  return true;
}

async function sendSmsOtp({ toPhone, text }) {
  // TODO: integrate Twilio / Vonage / Plivo here.
  console.log('[otpService] sendSmsOtp ->', { toPhone, text });
  return true;
}

module.exports = {
  generateNumericOtp,
  hashOtp,
  verifyOtpHash,
  sendEmailOtp,
  sendSmsOtp,
  OTP_TTL_MINUTES,
};
