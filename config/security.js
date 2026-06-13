const helmet = require('helmet');
const xssClean = require('xss-clean');
const globalRateLimiterModule = require('./securityRateLimit');

function applySecurityShield(app) {
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          // Tighten in production as needed.
          'default-src': ["'self'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'script-src': ["'self'"],
          'style-src': ["'self'", 'https:', "'unsafe-inline'"],
          'connect-src': ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginResourcePolicy: { policy: 'same-site' },
    })
  );

  app.use(xssClean());

  const { globalRateLimiter, authRateLimiter } = globalRateLimiterModule;
  app.use(globalRateLimiter);

  // authRateLimiter should be mounted per route by auth middleware.
  return { authRateLimiter };
}

module.exports = applySecurityShield;

