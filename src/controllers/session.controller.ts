import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { supabase } from '../database/connect';
import env from '../config/env';

function generateRefreshTokenPlain(): string {
  return crypto.randomBytes(48).toString('hex');
}

export async function issueRefreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { userId, deviceInfo } = req.body as {
      userId?: string;
      deviceInfo?: Record<string, string>;
    };

    if (!userId) {
      res.status(400).json({ success: false, message: 'userId required' });
      return;
    }

    const plain = generateRefreshTokenPlain();
    const hash = await bcrypt.hash(plain, 12);
    const expiresAt = new Date(
      Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { error } = await supabase.from('refresh_tokens').insert({
      user_id: userId,
      token_hash: hash,
      expires_at: expiresAt,
      device_info: deviceInfo,
    });

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    const isProd = env.NODE_ENV === 'production';
    res.cookie('refreshToken', plain, {
      httpOnly: true,
      secure: isProd || env.COOKIE_SECURE,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('[sessionController.issueRefreshToken]', err);
    res.status(500).json({ success: false, message: 'Failed to issue refresh token' });
  }
}

export async function refreshAccessToken(req: Request, res: Response): Promise<void> {
  try {
    const cookieToken = req.cookies?.refreshToken as string | undefined;
    if (!cookieToken) {
      res.status(401).json({ success: false, message: 'No refresh token' });
      return;
    }

    // Get all valid unexpired refresh tokens
    const { data: tokens, error } = await supabase
      .from('refresh_tokens')
      .select('*')
      .gt('expires_at', new Date().toISOString());

    if (error || !tokens) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    let matched = null;
    for (const t of tokens) {
      const ok = await bcrypt.compare(cookieToken, t.token_hash);
      if (ok) {
        matched = t;
        break;
      }
    }

    if (!matched) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', matched.user_id)
      .maybeSingle();

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    // Programmatically generate a new Supabase Auth session token
    const tempPassword = crypto.randomBytes(24).toString('hex');
    await supabase.auth.admin.updateUserById(user.id, { password: tempPassword });

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: tempPassword,
    });

    if (signInError || !signInData.session) {
      res.status(401).json({ success: false, message: signInError?.message || 'Refresh failed' });
      return;
    }

    const accessToken = signInData.session.access_token;
    const isProd = env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd || env.COOKIE_SECURE,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[sessionController.refreshAccessToken]', err);
    res.status(500).json({ success: false, message: 'Refresh failed' });
  }
}

export async function revokeRefreshToken(req: Request, res: Response): Promise<void> {
  try {
    const cookieToken = req.cookies?.refreshToken as string | undefined;
    if (!cookieToken) {
      res.status(400).json({ success: false, message: 'No refresh token' });
      return;
    }

    const { data: tokens } = await supabase.from('refresh_tokens').select('*');

    if (tokens) {
      for (const t of tokens) {
        const ok = await bcrypt.compare(cookieToken, t.token_hash).catch(() => false);
        if (ok) {
          await supabase.from('refresh_tokens').delete().eq('id', t.id);
        }
      }
    }

    const isProd = env.NODE_ENV === 'production';
    const clearOpts = {
      httpOnly: true,
      secure: isProd || env.COOKIE_SECURE,
      sameSite: isProd ? 'none' : 'lax',
    } as const;
    res.clearCookie('refreshToken', clearOpts);
    res.clearCookie('accessToken', clearOpts);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[sessionController.revokeRefreshToken]', err);
    res.status(500).json({ success: false, message: 'Revoke failed' });
  }
}
