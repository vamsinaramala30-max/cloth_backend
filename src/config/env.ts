import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';

const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5001),
  MONGODB_URI: z.string().trim().optional(),
  MONGO_URI: z.string().trim().optional(),

  JWT_SECRET: z
    .string()
    .trim()
    .min(32, 'JWT_SECRET is required and should be at least 32 characters')
    .optional(),
  JWT_REFRESH_SECRET: z.string().trim().optional(),

  FRONTEND_URL: z.string().trim().url('FRONTEND_URL must be a valid URL').optional(),
  STRIPE_SECRET_KEY: z.string().trim().min(1, 'STRIPE_SECRET_KEY is required').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().trim().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().trim().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().trim().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().trim().min(1).optional(),

  COOKIE_SECURE: z.preprocess((v) => v === 'true' || v === true, z.boolean().default(false)),

  MONGODB_SRV_HOST: z.string().trim().optional(),
  MONGO_SRV_HOST: z.string().trim().optional(),
  MONGODB_PORT: z.coerce.number().int().positive().default(27017),
  DB_CONNECT_RETRIES: z.coerce.number().int().positive().default(5),
  DB_CONNECT_RETRY_DELAY_MS: z.coerce.number().int().positive().default(3000),

  DNS_SERVER_HOST: z.string().trim().optional(),
  DNS_SERVER_PORT: z.coerce.number().int().positive().optional(),

  SKIP_DB: z.preprocess((v) => v === 'true' || v === true, z.boolean().default(false)),
  CORS_ALLOWED_ORIGINS: z.string().trim().optional(),

  SMTP_HOST: z.string().trim().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().trim().optional(),
  SMTP_PASS: z.string().trim().optional(),
  SMTP_SECURE: z.preprocess((v) => v === 'true' || v === true, z.boolean().default(false)),
  EMAIL_FROM: z.string().trim().optional(),

  ADMIN_API_TOKEN: z.string().trim().optional(),

  OTP_EXPIRY_MINUTES: z.coerce.number().int().positive().default(10),
  OTP_RATE_LIMIT_ATTEMPTS: z.coerce.number().int().positive().default(10),
  OTP_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  OTP_RATE_LIMIT_PER_WINDOW: z.coerce.number().int().positive().default(8),

  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
});

type EnvSchema = z.infer<typeof envSchema>;

const validation = envSchema.safeParse(process.env);

if (!validation.success) {
  console.error('[ENV VALIDATION FAILED]');
  validation.error.errors.forEach((error) => {
    console.error(`  - ${error.path.join('.')}: ${error.message}`);
  });
  process.exit(1);
}

const parsedEnv = validation.data;
const isDev = parsedEnv.NODE_ENV === 'development';

// Apply development defaults for missing secrets so the server can boot.
if (isDev) {
  parsedEnv.JWT_SECRET = parsedEnv.JWT_SECRET ?? 'dev_placeholder_jwt_secret_please_change_123456';
  parsedEnv.STRIPE_SECRET_KEY =
    parsedEnv.STRIPE_SECRET_KEY ?? 'dev_placeholder_stripe_secret_key_change_me';
  parsedEnv.FRONTEND_URL = parsedEnv.FRONTEND_URL ?? 'http://localhost:3000';
  parsedEnv.CLOUDINARY_CLOUD_NAME =
    parsedEnv.CLOUDINARY_CLOUD_NAME ?? 'dev_placeholder_cloud_name';
  parsedEnv.CLOUDINARY_API_KEY = parsedEnv.CLOUDINARY_API_KEY ?? 'dev_placeholder_cloud_api_key';
  parsedEnv.CLOUDINARY_API_SECRET =
    parsedEnv.CLOUDINARY_API_SECRET ?? 'dev_placeholder_cloud_api_secret';
  parsedEnv.JWT_REFRESH_SECRET =
    parsedEnv.JWT_REFRESH_SECRET ?? 'dev_placeholder_jwt_refresh_secret_change_123456';
}

const mongoUri = parsedEnv.MONGODB_URI ?? parsedEnv.MONGO_URI;

if (!mongoUri) {
  if (parsedEnv.NODE_ENV === 'production') {
    console.error(
      '[ENV VALIDATION FAILED] Missing required environment variable: MONGODB_URI or MONGO_URI',
    );
    process.exit(1);
  }
  console.warn(
    '[ENV] No MongoDB URI provided. Backend will run in degraded mode without DB in development.',
  );
}

const corsAllowedOrigins: string[] = parsedEnv.CORS_ALLOWED_ORIGINS
  ? parsedEnv.CORS_ALLOWED_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

const defaultAllowedOrigins: string[] = [
  parsedEnv.FRONTEND_URL,
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://localhost:3001',
  ...corsAllowedOrigins,
].filter((o): o is string => Boolean(o));

// Export a single typed config object — never access process.env directly elsewhere
const env = {
  ...parsedEnv,
  MONGO_URI: mongoUri,
  CORS_ALLOWED_ORIGINS: corsAllowedOrigins,
  DEFAULT_ALLOWED_ORIGINS: defaultAllowedOrigins,
} as EnvSchema & {
  MONGO_URI: string | undefined;
  CORS_ALLOWED_ORIGINS: string[];
  DEFAULT_ALLOWED_ORIGINS: string[];
};

export default env;
