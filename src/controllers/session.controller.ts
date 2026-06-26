import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import RefreshToken from '../models/refreshToken';
import User from '../models/user';
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
    );

    await RefreshToken.create({ userId, tokenHash: hash, expiresAt, deviceInfo });

    res.cookie('refreshToken', plain, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production' || env.COOKIE_SECURE,
      sameSite: 'strict',
      maxAge: expiresAt.getTime() - Date.now(),
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

    const tokens = await RefreshToken.find({ expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 })
      .limit(100);

    let matched = null;
    for (const t of tokens) {
      const ok = await bcrypt.compare(cookieToken, t.tokenHash);
      if (ok) {
        matched = t;
        break;
      }
    }

    if (!matched) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    const user = await User.findById(matched.userId);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    const accessToken = jwt.sign(
      { id: user._id.toString(), role: user.role },
      env.JWT_SECRET as string,
      { expiresIn: '15m' },
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production' || env.COOKIE_SECURE,
      sameSite: 'strict',
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

    const tokens = await RefreshToken.find();
    for (const t of tokens) {
      const ok = await bcrypt.compare(cookieToken, t.tokenHash).catch(() => false);
      if (ok) await RefreshToken.findByIdAndDelete(t._id);
    }

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[sessionController.revokeRefreshToken]', err);
    res.status(500).json({ success: false, message: 'Revoke failed' });
  }
}
