const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const connectDatabase = require('../config/db');
const applySecurityShield = require('../config/security');
const corsOptions = require('../config/cors');
const masterRouterMatrix = require('../routes/index');

const app = express();
app.set('trust proxy', 1);

applySecurityShield(app);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use('/api', masterRouterMatrix);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error('[UNHANDLED SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    message: 'Unexpected server error. Please try again later.',
  });
});

async function startServer() {
  try {
    const db = await connectDatabase();

    const server = app.listen(env.PORT, () => {
      console.log('\n======================================================');
      console.log('[RARE RABBIT ENTERPRISE PLATFORM RUNNING]');
      console.log('STATUS: BROADCAST LAYER VERIFIED');
      console.log(`PORT TARGET: ${env.PORT}`);
      console.log(`ENVIRONMENT: ${env.NODE_ENV}`);
      console.log(`FRONTEND URL: ${env.FRONTEND_URL}`);
      console.log('======================================================\n');
    });

    // Prevent unhandled crash when the port is already taken.
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error('\n[SERVER STARTUP ERROR] Port already in use:', env.PORT);
        console.error('[SERVER STARTUP ERROR] Fix: stop the other process using this port OR start backend with a different PORT.');
      } else {
        console.error('[SERVER STARTUP ERROR]', err);
      }
      process.exit(1);
    });

    // Graceful shutdown helpers
    const shutdown = async (signal) => {
      console.log(`\n[SHUTDOWN] Received ${signal}, closing server and DB connection...`);
      try {
        server.close(() => console.log('[SHUTDOWN] HTTP server closed'));
        if (db && typeof db.close === 'function') await db.close();
        console.log('[SHUTDOWN] Database connection closed');
        process.exit(0);
      } catch (err) {
        console.error('[SHUTDOWN] Error during shutdown', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('unhandledRejection', (reason) => {
      console.error('[UNHANDLED REJECTION]', reason);
    });
  } catch (error) {
    console.error('[DATABASE CONNECTION FAILED]', error);
    process.exit(1);
  }
}

startServer();

