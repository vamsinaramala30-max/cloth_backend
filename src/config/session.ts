import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import env from './env';

/**
 * Sign an access token for the given user.
 */
export function signAccessToken(userId: string, userRole: string): string {
  return jwt.sign({ id: userId, role: userRole }, env.JWT_SECRET as string, {
    expiresIn: '30m',
    algorithm: 'HS256',
  });
}

/**
 * Set the accessToken httpOnly cookie on the response.
 */
export function sendSecureCookie(res: Response, token: string): void {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production' || env.COOKIE_SECURE,
    sameSite: 'none',
    maxAge: 30 * 60 * 1000, // 30 minutes
  });
}
