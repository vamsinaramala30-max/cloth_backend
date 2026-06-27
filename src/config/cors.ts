import type { CorsOptions } from 'cors';
import env from './env';

const allowedOrigins = env.DEFAULT_ALLOWED_ORIGINS.map((url) =>
  url.trim().replace(/\/$/, ''),
);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    const normalizedOrigin = origin.trim().replace(/\/$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
