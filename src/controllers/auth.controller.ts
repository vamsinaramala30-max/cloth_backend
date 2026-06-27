import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import env from '../config/env';
import User from '../models/user';

function generateTokens(id: string, role: string): { accessToken: string } {
  const accessToken = jwt.sign({ id, role }, env.JWT_SECRET as string, { expiresIn: '15m' });
  return { accessToken };
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Identity registration overlap.' });
      return;
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      isVerified: true,
    });

    const { accessToken } = generateTokens(user._id.toString(), user.role);

    const isProd = env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd || env.COOKIE_SECURE,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    res.status(500).json({ success: false, message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid dynamic credentials.' });
      return;
    }

    const { accessToken } = generateTokens(user._id.toString(), user.role);

    const isProd = env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd || env.COOKIE_SECURE,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(500).json({ success: false, message });
  }
};
