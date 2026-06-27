import type { Request, Response } from 'express';
import { supabase } from '../database/connect';
import env from '../config/env';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    // 1. Check if user already exists in public.users
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      res.status(400).json({ success: false, message: 'Identity registration overlap.' });
      return;
    }

    // 2. Sign up in Supabase Auth (admin method to auto-verify email)
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (signUpError || !signUpData.user) {
      res.status(400).json({ success: false, message: signUpError?.message || 'Registration failed' });
      return;
    }

    // 3. Create record in public.users
    const { error: insertError } = await supabase.from('users').insert({
      id: signUpData.user.id,
      name,
      email: email.toLowerCase(),
      role: 'customer',
      is_verified: true,
    });

    if (insertError) {
      res.status(500).json({ success: false, message: insertError.message });
      return;
    }

    // 4. Sign in to generate a session/token
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password,
    });

    if (signInError || !signInData.session) {
      res.status(400).json({ success: false, message: signInError?.message || 'Login failed after signup' });
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

    res.status(201).json({
      success: true,
      user: { name, email: email.toLowerCase(), role: 'customer' },
      token: accessToken,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    res.status(500).json({ success: false, message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    // 1. Sign in via Supabase Auth
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (signInError || !signInData.session || !signInData.user) {
      res.status(401).json({ success: false, message: 'Invalid dynamic credentials.' });
      return;
    }

    // 2. Fetch public profile role
    const { data: profile } = await supabase
      .from('users')
      .select('name, email, role')
      .eq('id', signInData.user.id)
      .single();

    const accessToken = signInData.session.access_token;
    const isProd = env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd || env.COOKIE_SECURE,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      user: {
        name: profile?.name || signInData.user.user_metadata?.name || '',
        email: profile?.email || signInData.user.email || '',
        role: profile?.role || 'customer',
      },
      token: accessToken,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(500).json({ success: false, message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    await supabase.auth.signOut();
    const isProd = env.NODE_ENV === 'production';
    const clearOpts = {
      httpOnly: true,
      secure: isProd || env.COOKIE_SECURE,
      sameSite: isProd ? 'none' : 'lax',
    } as const;
    res.clearCookie('accessToken', clearOpts);
    res.clearCookie('refreshToken', clearOpts);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    res.status(500).json({ success: false, message });
  }
};
