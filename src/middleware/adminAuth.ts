import type { Request, Response, NextFunction } from 'express';
import env from '../config/env';

/**
 * Validate admin token from x-admin-token header or adminToken query param.
 */
export default function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const token =
    (req.headers['x-admin-token'] as string | undefined) ??
    (req.query['adminToken'] as string | undefined);

  if (!token || !env.ADMIN_API_TOKEN || token !== env.ADMIN_API_TOKEN) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  next();
}
