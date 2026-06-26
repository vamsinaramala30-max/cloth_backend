import mongoose from 'mongoose';
import env from '../config/env';
import { patchDnsIfNeeded } from '../config/dns';

import { setupMockMongoose } from './mockMongoose';

function validateEnv(): void {
  if (env.SKIP_DB) {
    console.warn('[DB] SKIP_DB=true detected; skipping env validation that requires MongoDB URI.');
    return;
  }
  const hasMongo = Boolean(env.MONGO_URI);
  if (!hasMongo) {
    if (env.NODE_ENV === 'production') {
      throw new Error('Missing env var: MONGODB_URI or MONGO_URI');
    }
    console.warn('[DB] No MongoDB URI provided; running without DB in development mode.');
  }
}

function getMongoSrvHostOverride(): string {
  const candidates = [env.MONGODB_SRV_HOST, env.MONGO_SRV_HOST].filter(
    (h): h is string => Boolean(h),
  );
  const invalidHosts = new Set(['0.0.0.0', 'localhost', '127.0.0.1']);
  return candidates.find((host) => !invalidHosts.has(host.trim())) ?? '';
}

function normalizeMongoSrvUri(uri: string): string {
  const replacementHost = getMongoSrvHostOverride();
  if (!replacementHost || !uri.startsWith('mongodb+srv://')) {
    return uri;
  }
  const withoutScheme = uri.replace(/^mongodb\+srv:\/\//, '');
  const queryIndex = withoutScheme.indexOf('?');
  const hostAndPath = queryIndex === -1 ? withoutScheme : withoutScheme.slice(0, queryIndex);
  const queryAndOptions = queryIndex === -1 ? '' : withoutScheme.slice(queryIndex);
  const pathIndex = hostAndPath.indexOf('/');
  const hostPart = pathIndex === -1 ? hostAndPath : hostAndPath.slice(0, pathIndex);
  const pathAndDb = pathIndex === -1 ? '' : hostAndPath.slice(pathIndex);
  const atIndex = hostPart.indexOf('@');
  const creds = atIndex === -1 ? '' : hostPart.slice(0, atIndex);
  const prefix = creds ? `${creds}@` : '';
  return `mongodb+srv://${prefix}${replacementHost}${pathAndDb}${queryAndOptions}`;
}

function maybeConvertSrvToNonSrv(uri: string): string {
  const srvHost = getMongoSrvHostOverride();
  if (!srvHost || !uri.startsWith('mongodb+srv://')) return uri;

  const port = env.MONGODB_PORT;
  const withoutScheme = uri.replace(/^mongodb\+srv:\/\//, '');
  const queryIndex = withoutScheme.indexOf('?');
  const hostAndPath = queryIndex === -1 ? withoutScheme : withoutScheme.slice(0, queryIndex);
  const optionsPart = queryIndex === -1 ? '' : withoutScheme.slice(queryIndex);
  const pathIndex = hostAndPath.indexOf('/');
  const hostPart = pathIndex === -1 ? hostAndPath : hostAndPath.slice(0, pathIndex);
  const dbPath = pathIndex === -1 ? '' : hostAndPath.slice(pathIndex);
  const atIndex = hostPart.indexOf('@');
  let creds = '';
  if (atIndex !== -1) {
    creds = hostPart.slice(0, atIndex);
    const colonIdx = creds.indexOf(':');
    if (colonIdx !== -1) {
      const user = creds.slice(0, colonIdx);
      const pass = creds.slice(colonIdx + 1);
      creds = `${user}:${encodeURIComponent(pass)}`;
    }
  }
  const prefix = creds ? `${creds}@` : '';
  return `mongodb://${prefix}${srvHost}:${port}${dbPath}${optionsPart}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isSrvResolutionError(err: unknown): boolean {
  if (err instanceof Error) {
    const e = err as NodeJS.ErrnoException;
    return e.code === 'ECONNREFUSED' && e.message.includes('querySrv');
  }
  return false;
}

type MockConnection = { close: () => Promise<void> };
type DbConnection = typeof mongoose.connection | MockConnection;

async function connectDatabase(): Promise<DbConnection> {
  validateEnv();
  patchDnsIfNeeded();

  let uri = env.MONGO_URI ?? '';

  // Skip flag — return a no-op mock
  if (env.SKIP_DB) {
    console.warn('[DB] SKIP_DB=true detected; skipping MongoDB connection attempts.');
    setupMockMongoose();
    return { close: async () => console.log('[DB] Mock connection closed (SKIP_DB)') };
  }

  if (!uri && env.NODE_ENV !== 'production') {
    console.warn('[DB] Skipping real MongoDB connection (development no-DB mode).');
    return { close: async () => console.log('[DB] Mock connection closed') };
  }

  // Proactively convert SRV if host override provided
  if (uri.startsWith('mongodb+srv://') && (env.MONGODB_SRV_HOST || env.MONGO_SRV_HOST)) {
    uri = maybeConvertSrvToNonSrv(uri);
    console.log('[Mongo] Proactively using non-SRV connection (mongodb://).');
  }

  const maxRetries = env.DB_CONNECT_RETRIES;
  const retryDelayMs = env.DB_CONNECT_RETRY_DELAY_MS;

  if (env.DNS_SERVER_HOST) {
    console.log(`[DNS] DNS_SERVER_HOST=${env.DNS_SERVER_HOST} DNS_SERVER_PORT=${env.DNS_SERVER_PORT ?? 53}`);
  }
  console.log(`[DB] Mongo URI starts with: ${uri.slice(0, 60)}`);

  let lastErr: unknown;

  const mongooseOptions = {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    connectTimeoutMS: 10_000,
    family: 4,
  };

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      let finalUri = normalizeMongoSrvUri(uri);
      if (finalUri.startsWith('mongodb+srv://') && (env.MONGODB_SRV_HOST || env.MONGO_SRV_HOST)) {
        finalUri = maybeConvertSrvToNonSrv(finalUri);
      }

      await mongoose.connect(finalUri, mongooseOptions);
      console.log('[DB] MongoDB connection successful!');
      mongoose.set('strictQuery', true);
      return mongoose.connection;
    } catch (err) {
      lastErr = err;
      const code = (err as NodeJS.ErrnoException).code;
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[DATABASE CONNECTION FAILED] Attempt ${attempt}/${maxRetries}. code=${code} message=${message}`,
      );

      if (isSrvResolutionError(err)) {
        console.error('[DNS] SRV lookup failed. Attempting non-SRV fallback...');
        const fallbackUri = maybeConvertSrvToNonSrv(uri);
        if (fallbackUri !== uri) {
          try {
            await mongoose.connect(fallbackUri, mongooseOptions);
            mongoose.set('strictQuery', true);
            return mongoose.connection;
          } catch (fallbackErr) {
            lastErr = fallbackErr;
            const fbMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
            console.error(`[Mongo fallback failed] message=${fbMsg}`);
          }
        }
      }

      if (attempt < maxRetries) {
        await sleep(retryDelayMs);
      }
    }
  }

  throw lastErr;
}

export default connectDatabase;
