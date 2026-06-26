import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';

import env from './config/env';
import connectDatabase from './database/connect';
import { applySecurityShield } from './config/security';
import corsOptions from './config/cors';
import masterRouter from './routes/index';
import { AppError } from './errors/AppError';

const app = express();
app.set('trust proxy', 1);

// Security middleware (helmet, xss-clean, global rate limiter)
applySecurityShield(app);

// Core middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount all API routes
app.use('/api', masterRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Resource not found`,
  });
});

// Centralized error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error('[UNHANDLED SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    message: 'Unexpected server error. Please try again later.',
  });
});

async function startServer(): Promise<void> {
  try {
    const db = await connectDatabase();

    const server = app.listen(env.PORT, () => {
      console.log('\n==========================================');
      console.log('Backend Running Successfully');
      console.log(`Environment : ${env.NODE_ENV}`);
      console.log(`Backend URL : http://localhost:${env.PORT}`);
      console.log(`API URL     : http://localhost:${env.PORT}/api`);
      console.log(`Frontend    : ${env.FRONTEND_URL ?? 'not set'}`);
      console.log(`MongoDB     : Connected`);
      console.log('==========================================\n');
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[SERVER STARTUP ERROR] Port already in use: ${env.PORT}`);
        console.error('[SERVER STARTUP ERROR] Stop the other process or use a different PORT.');
      } else {
        console.error('[SERVER STARTUP ERROR]', err);
      }
      process.exit(1);
    });

    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n[SHUTDOWN] Received ${signal}, closing server and DB connection...`);
      try {
        server.close(() => console.log('[SHUTDOWN] HTTP server closed'));
        if (db && typeof (db as { close?: () => Promise<void> }).close === 'function') {
          await (db as { close: () => Promise<void> }).close();
        }
        console.log('[SHUTDOWN] Database connection closed');
        process.exit(0);
      } catch (err) {
        console.error('[SHUTDOWN] Error during shutdown', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('unhandledRejection', (reason) => {
      console.error('[UNHANDLED REJECTION]', reason);
    });
  } catch (error) {
    console.error('[DATABASE CONNECTION FAILED]', error);
    process.exit(1);
  }
}

void startServer();
