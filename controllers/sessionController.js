'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/user');
const env = require('../src/config/env');

function generateRefreshTokenPlain() {
  return crypto.randomBytes(48).toString('hex');
}

async function issueRefreshToken(req, res) {
  try {
    const { userId, deviceInfo } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const plain = generateRefreshTokenPlain();
    const hash = await bcrypt.hash(plain, 12);
    const expiresAt = new Date(Date.now() + (Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30) * 24 * 60 * 60 * 1000));

    await RefreshToken.create({ userId, tokenHash: hash, expiresAt, deviceInfo });

    // Set httpOnly cookie
    res.cookie('refreshToken', plain, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production' || env.COOKIE_SECURE,
      sameSite: 'strict',
      maxAge: expiresAt.getTime() - Date.now(),
    });

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('[sessionController.issueRefreshToken]', err);
    return res.status(500).json({ success: false, message: 'Failed to issue refresh token' });
  }
}

async function refreshAccessToken(req, res) {
  try {
    const cookieToken = req.cookies?.refreshToken;
    if (!cookieToken) return res.status(401).json({ success: false, message: 'No refresh token' });

    // Find matching refresh token by verifying hash
    const tokens = await RefreshToken.find({ expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 }).limit(100);
    let matched = null;
    for (const t of tokens) {
      const ok = await bcrypt.compare(cookieToken, t.tokenHash);
      if (ok) { matched = t; break; }
    }

    if (!matched) return res.status(401).json({ success: false, message: 'Invalid refresh token' });

    const user = await User.findById(matched.userId);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const accessToken = jwt.sign({ id: user._id.toString(), role: user.role }, env.JWT_SECRET, { expiresIn: '15m' });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production' || env.COOKIE_SECURE,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[sessionController.refreshAccessToken]', err);
    return res.status(500).json({ success: false, message: 'Refresh failed' });
  }
}

async function revokeRefreshToken(req, res) {
  try {
    const cookieToken = req.cookies?.refreshToken;
    if (!cookieToken) return res.status(400).json({ success: false, message: 'No refresh token' });

    // Delete any tokens that match cookie
    const tokens = await RefreshToken.find();
    for (const t of tokens) {
      const ok = await bcrypt.compare(cookieToken, t.tokenHash).catch(() => false);
      if (ok) await RefreshToken.findByIdAndDelete(t._id);
    }

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[sessionController.revokeRefreshToken]', err);
    return res.status(500).json({ success: false, message: 'Revoke failed' });
  }
}

module.exports = { issueRefreshToken, refreshAccessToken, revokeRefreshToken };
