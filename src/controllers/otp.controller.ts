import type { Request, Response } from 'express';
import crypto from 'crypto';
import env from '../config/env';
import { supabase } from '../database/connect';
import { generateNumericOtp, hashOtp, verifyOtpHash, OTP_TTL_MINUTES } from '../utils/otpService';

// Simple in-memory attempt counter
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
    const expiry = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    let user: any = null;
    if (email) {
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      user = dbUser;

      if (!user && action === 'register') {
        // Create user in Supabase Auth first
        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
          email: email.toLowerCase(),
          email_confirm: true,
          user_metadata: { name: email.split('@')[0] ?? email },
        });

        if (authErr || !authUser.user) {
          res.status(500).json({ success: false, message: authErr?.message || 'Auth registration failed' });
          return;
        }

        // Create in public.users
        const { data: newUser, error: insertErr } = await supabase
          .from('users')
          .insert({
            id: authUser.user.id,
            name: email.split('@')[0] ?? email,
            email: email.toLowerCase(),
            is_verified: false,
          })
          .select()
          .single();

        if (insertErr || !newUser) {
          res.status(500).json({ success: false, message: insertErr?.message || 'Database registration failed' });
          return;
        }
        user = newUser;
      }
    }

    if (user) {
      await supabase
        .from('users')
        .update({
          verification_otp: hashed,
          otp_expiry: expiry,
        })
        .eq('id', user.id);
    }

    // Masked log for simulation/emails (RaRe RaB It mock)
    console.log(`[OTP SENT] Verification code for ${key} is: ${otp}`);

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

    let user: any = null;
    if (email) {
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      user = dbUser;
    }

    if (!user || !user.verification_otp || !user.otp_expiry) {
      res.status(400).json({ success: false, message: 'No pending OTP for this account' });
      return;
    }

    if (new Date() > new Date(user.otp_expiry)) {
      res.status(400).json({ success: false, message: 'OTP expired' });
      return;
    }

    const ok = await verifyOtpHash(otp, user.verification_otp);
    if (!ok) {
      res.status(401).json({ success: false, message: 'Invalid OTP' });
      return;
    }

    // Update user verification status and clear otp
    await supabase
      .from('users')
      .update({
        is_verified: true,
        verification_otp: null,
        otp_expiry: null,
      })
      .eq('id', user.id);

    // Generate a valid Supabase Auth session programmatically
    const tempPassword = crypto.randomBytes(24).toString('hex');
    await supabase.auth.admin.updateUserById(user.id, { password: tempPassword });

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: tempPassword,
    });

    if (signInError || !signInData.session) {
      res.status(500).json({ success: false, message: signInError?.message || 'Login failed after verification' });
      return;
    }

    const token = signInData.session.access_token;
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
      token,
    });
  } catch (err) {
    console.error('[otpcontroller.verifyOtp] ', err);
    res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
}
