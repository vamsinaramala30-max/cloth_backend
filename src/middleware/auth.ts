import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../database/connect';

/**
 * Verify JWT from cookie or Authorization header and attach decoded payload to req.user.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token =
      req.cookies?.accessToken ??
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : undefined);

    if (!token) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    // Call Supabase API to get the user corresponding to the token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
      return;
    }

    // Fetch the user's role and details from the public profile table
    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    req.user = {
      id: user.id,
      role: dbUser?.role || 'customer',
    };

    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * Authorize one or more roles. Must be used after authenticate.
 */
export const authorize =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }
    next();
  };
