const env = require('../src/config/env');

const allowedOrigins = env.DEFAULT_ALLOWED_ORIGINS;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      console.log('Incoming origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(null, true);
    } else {
      callback(new Error('[ORIGIN ISOLATION BLOCKED BY CORS MATRIX]'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;