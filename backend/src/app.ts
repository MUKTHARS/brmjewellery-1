import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { corsMiddleware } from './middleware/cors.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { notFound } from './middleware/notFound.middleware';
import apiRoutes from './routes/index.routes';
import { env } from './config/env.config';

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(corsMiddleware);

// Performance
app.use(compression());

// Logging
app.use(requestLogger);

// Body parsing — webhook route needs raw body, so must come before json middleware
app.use('/api/v1/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use(globalRateLimiter);

// Static file serving for uploads
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR), {
  maxAge: env.NODE_ENV === 'production' ? '7d' : 0,
  etag: true,
}));

// API routes
app.use(`/api/${env.API_VERSION}`, apiRoutes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

export default app;
