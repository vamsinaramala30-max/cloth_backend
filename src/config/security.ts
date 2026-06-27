import type { Application, RequestHandler } from 'express';
import helmet from 'helmet';
import xssClean from 'xss-clean';
import { globalRateLimiter, authRateLimiter } from './rateLimit';

/**
 * Apply security middleware to the Express app.
 * Returns authRateLimiter for per-route mounting.
 */
export function applySecurityShield(app: Application): { authRateLimiter: RequestHandler } {
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'script-src': ["'self'"],
          'style-src': ["'self'", 'https:', "'unsafe-inline'"],
          'connect-src': ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(xssClean());
  app.use(globalRateLimiter);

  return { authRateLimiter };
}
