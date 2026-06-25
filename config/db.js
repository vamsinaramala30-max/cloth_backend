const mongoose = require('mongoose');

const env = require('../src/config/env');
const { patchDnsIfNeeded } = require('./dns');

function validateEnv() {
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

function getMongoSrvHostOverride() {
  const candidates = [env.MONGODB_SRV_HOST, env.MONGO_SRV_HOST].filter(Boolean);
  const invalidHosts = new Set(['0.0.0.0', 'localhost', '127.0.0.1']);
  const validCandidate = candidates.find((host) => !invalidHosts.has(host.trim()));
  return validCandidate || '';
}

function normalizeMongoSrvUri(uri) {
  const replacementHost = getMongoSrvHostOverride();
  if (!replacementHost || typeof uri !== 'string' || !uri.startsWith('mongodb+srv://')) {
    if (replacementHost && typeof uri === 'string' && !uri.startsWith('mongodb+srv://')) {
      console.warn(
        '[Mongo] SRV host override provided, but current URI is not mongodb+srv://. Ignoring host override.'
      );
    }
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getErrCodeAndMessage(err) {
  return {
    code: err && err.code,
    message: err && err.message ? String(err.message) : '',
  };
}

function isSrvResolutionError(err) {
  const { code, message } = getErrCodeAndMessage(err);
  return code === 'ECONNREFUSED' && message.includes('querySrv');
}

function maybeConvertSrvToNonSrv(uri) {
  // If SRV resolution is blocked in the environment, convert mongodb+srv:// to mongodb://
  // using an explicitly provided host. This allows connecting without performing SRV lookups.
  //
  // Required env vars when using this:
  // - MONGODB_SRV_HOST or MONGO_SRV_HOST (e.g. cluster0.lgjazma.mongodb.net)
  //
  // Optional:
  // - MONGODB_PORT (default 27017)
  //
  // Note: Atlas often supports direct host connection on 27017.
  const srvHost = getMongoSrvHostOverride();
  if (!srvHost) return uri;

  const port = env.MONGODB_PORT;

  // Only convert mongodb+srv:// URIs
  if (typeof uri !== 'string' || !uri.startsWith('mongodb+srv://')) return uri;

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
    // Mongo URIs require that the password be URL-encoded.
    // If the existing URI had a raw password, mongoose may throw:
    // "Password contains unescaped characters".
    // We attempt to url-encode only the password part.
    const colonIdx = creds.indexOf(':');
    if (colonIdx !== -1) {
      const user = creds.slice(0, colonIdx);
      const pass = creds.slice(colonIdx + 1);
      creds = `${user}:${encodeURIComponent(pass)}`;
    }
  }

  // If URI already had credentials, keep them
  const prefix = creds ? `${creds}@` : '';
  return `mongodb://${prefix}${srvHost}:${port}${dbPath}${optionsPart}`;
}

async function connectDatabase() {
  validateEnv();

  // Optional DNS override for SRV lookups (Mongo Atlas).
  patchDnsIfNeeded();

  let uri = env.MONGO_URI;

  // Honor explicit skip flag to avoid attempting DB connection
  if (env.SKIP_DB) {
    console.warn('[DB] SKIP_DB=true detected; skipping real MongoDB connection.');
    return {
      close: async () => {
        console.log('[DB] Mock connection closed (SKIP_DB)');
      },
    };
  }

  // If no URI present and running in development, return a no-op mock connection
  if (!uri && env.NODE_ENV !== 'production') {
    console.warn('[DB] Skipping real MongoDB connection (development no-DB mode).');
    return {
      close: async () => {
        console.log('[DB] Mock connection closed');
      },
    };
  }

  // IMPORTANT: If the SRV host override is provided, prefer non-SRV connection proactively.
  // This avoids triggering any mongodb+srv:// SRV DNS queries when SRV is blocked.
  if (uri && typeof uri === 'string' && uri.startsWith('mongodb+srv://')) {
    const shouldUseNonSrv = Boolean(env.MONGODB_SRV_HOST || env.MONGO_SRV_HOST);
    if (shouldUseNonSrv) {
      uri = maybeConvertSrvToNonSrv(uri);
      console.log('[Mongo] Proactively using non-SRV connection (mongodb://) due to SRV host override.');
    }
  }


  // Retry logic: Atlas SRV resolution or network can be temporarily unavailable.
  const maxRetries = env.DB_CONNECT_RETRIES;
  const retryDelayMs = env.DB_CONNECT_RETRY_DELAY_MS;

  if (env.DNS_SERVER_HOST) {
    console.log(`[DNS] DNS_SERVER_HOST=${env.DNS_SERVER_HOST} DNS_SERVER_PORT=${env.DNS_SERVER_PORT ?? 53}`);
  }
  const hostOverride = getMongoSrvHostOverride();
  if (hostOverride) {
    console.log(`[Mongo] Using explicit host override for SRV/non-SRV fallback: ${hostOverride}`);
  }

  console.log(`[DB] Mongo URI starts with: ${typeof uri === 'string' ? uri.slice(0, 60) : 'unknown'}`);

  let lastErr;

  // Allow developers to run the backend without MongoDB.
  // Enable by setting SKIP_DB=true in your environment.
  // If SKIP_DB is set, never attempt to connect.
  const skipDbFlag = String(process.env.SKIP_DB ?? '').toLowerCase() === 'true' || Boolean(env.SKIP_DB);
  if (skipDbFlag) {
    console.warn('[DB] SKIP_DB=true detected; skipping MongoDB connection attempts.');
    return {
      close: async () => {
        console.log('[DB] Mock connection closed (SKIP_DB)');
      },
    };
  }


  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const maybeNormalized = normalizeMongoSrvUri(uri);

      // If SRV is blocked in this environment, and a non-SRV host override is provided,
      // ensure mongoose.connect never receives mongodb+srv://.
      let finalUri = maybeNormalized;
      if (typeof finalUri === 'string' && finalUri.startsWith('mongodb+srv://')) {
        const shouldUseNonSrv = Boolean(env.MONGODB_SRV_HOST || env.MONGO_SRV_HOST);
        if (shouldUseNonSrv) {
          finalUri = maybeConvertSrvToNonSrv(finalUri);
        }
      }

      // If we have an explicit host override, ensure we never call mongodb+srv://.
      // This prevents mongodb from attempting SRV lookups (querySrv) before we can fallback.
      if (
        typeof finalUri === 'string' &&
        finalUri.startsWith('mongodb+srv://') &&
        (env.MONGODB_SRV_HOST || env.MONGO_SRV_HOST)
      ) {
        finalUri = maybeConvertSrvToNonSrv(finalUri);
      }

      // Use conservative options suitable for Atlas and modern mongoose
      await mongoose.connect(finalUri, {
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 10_000,
        socketTimeoutMS: 45_000,
        // The following options are safe with current mongoose versions
        // and help with connection stability in cloud environments.
        connectTimeoutMS: 10_000,
        family: 4,
      });
      console.log('[DB] MongoDB connection successful!');



      mongoose.set('strictQuery', true);
      return mongoose.connection;
    } catch (err) {
      lastErr = err;
      const { code, message } = getErrCodeAndMessage(err);

      console.error(`[DATABASE CONNECTION FAILED] Attempt ${attempt}/${maxRetries}. code=${code} message=${message}`);

      if (isSrvResolutionError(err)) {
        console.error(
          '[DNS] SRV lookup failed (ECONNREFUSED). Atlas SRV resolution is blocked in this environment.'
        );

        // Fallback: convert mongodb+srv:// -> mongodb:// using explicit host
        // so we don't depend on SRV DNS lookups.
        const fallbackUri = maybeConvertSrvToNonSrv(uri);
        if (fallbackUri !== uri) {
          console.log('[Mongo] Falling back to non-SRV connection using explicit host (mongodb://).');
          try {
            await mongoose.connect(fallbackUri, {
                  maxPoolSize: 20,
                  serverSelectionTimeoutMS: 10_000,
                  socketTimeoutMS: 45_000,
                  connectTimeoutMS: 10_000,
                  family: 4,
                });
            mongoose.set('strictQuery', true);
            return mongoose.connection;
          } catch (fallbackErr) {
            lastErr = fallbackErr;
            const fb = getErrCodeAndMessage(fallbackErr);
            console.error(`[Mongo fallback failed] code=${fb.code} message=${fb.message}`);
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

module.exports = connectDatabase;