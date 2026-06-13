'use strict';

const nodemailer = require('nodemailer');
const env = require('../src/config/env');

let transporter = null;

function createTransporter() {
  if (transporter) return transporter;
  // If SMTP env vars present, use them; otherwise use a console transporter
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    transporter = {
      sendMail: async (opts) => {
        console.log('[mailService] Pretend sendMail:', opts);
        return true;
      },
    };
  }
  return transporter;
}

async function sendWelcomeEmail({ to, subject, text, html }) {
  const t = createTransporter();
  const fromAddress = process.env.MAIL_FROM || 'noreply@rare-rab-it.local';
  try {
    await t.sendMail({ from: fromAddress, to, subject, text, html });
    return true;
  } catch (err) {
    console.error('[mailService.sendWelcomeEmail]', err);
    return false;
  }
}

module.exports = { sendWelcomeEmail };
