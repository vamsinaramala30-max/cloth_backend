import type { CorsOptions } from 'cors';
import env from './env';

const allowedOrigins = env.DEFAULT_ALLOWED_ORIGINS;

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
