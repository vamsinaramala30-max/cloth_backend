import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import env from '../config/env';
import User from '../models/user';
import { generateNumericOtp, hashOtp, verifyOtpHash, sendEmailOtp, sendSmsOtp, OTP_TTL_MINUTES } from '../utils/otpService';

// Simple in-memory attempt counter (for demo; use Redis in production)
const attempts = new Map<string, number>();

function increaseAttempts(key: string): void {
  const cur = attempts.get(key) ?? 0;
  attempts.set(key, cur + 1);
}

export async function sendOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email, phone, action } = (req.body ?? {}) as {
      email?: string;
      phone?: string;
      action?: string;
    };

    if (!email && !phone) {
      res.status(400).json({ success: false, message: 'email or phone required' });
      return;
    }

    const key = email ?? phone ?? '';
    const nowAttempts = attempts.get(key) ?? 0;
    if (nowAttempts > env.OTP_RATE_LIMIT_ATTEMPTS) {
      res.status(429).json({ success: false, message: 'Too many OTP requests' });
      return;
    }

    increaseAttempts(key);

    const otp = generateNumericOtp();
    const hashed = await hashOtp(otp);
    const expiry = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    let user = null;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user && action === 'register') {
        user = await User.create({
          name: email.split('@')[0] ?? email,
          email: email.toLowerCase(),
          isVerified: false,
        });
      }
    }

    if (user) {
      user.verificationOtp = hashed;
      user.otpExpiry = expiry;
      await user.save();
    }

    if (email) {
      const subject = 'Your RARE RAB IT verification code';
      const text = `Your verification code is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`;
      await sendEmailOtp({ toEmail: email, subject, text, html: `<p>${text}</p>` });
    } else if (phone) {
      const text = `Your RARE RAB IT code: ${otp}. Expires in ${OTP_TTL_MINUTES}m.`;
      await sendSmsOtp({ toPhone: phone, text });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent (masked).',
      expiresInMinutes: OTP_TTL_MINUTES,
    });
  } catch (err) {
    console.error('[otpcontroller.sendOtp] ', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
}

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email, phone, otp } = (req.body ?? {}) as {
      email?: string;
      phone?: string;
      otp?: string;
    };

    if (!otp || (!email && !phone)) {
      res.status(400).json({ success: false, message: 'otp and email/phone required' });
      return;
    }

    let user = null;
    if (email) user = await User.findOne({ email: email.toLowerCase() });

    if (!user?.verificationOtp || !user?.otpExpiry) {
      res.status(400).json({ success: false, message: 'No pending OTP for this account' });
      return;
    }

    if (new Date() > new Date(user.otpExpiry)) {
      res.status(400).json({ success: false, message: 'OTP expired' });
      return;
    }

    const ok = await verifyOtpHash(otp, user.verificationOtp);
    if (!ok) {
      res.status(401).json({ success: false, message: 'Invalid OTP' });
      return;
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      env.JWT_SECRET as string,
      { expiresIn: '15m' },
    );

    const isProd = env.NODE_ENV === 'production';
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: isProd || env.COOKIE_SECURE,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('[otpcontroller.verifyOtp] ', err);
    res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
}
