import winston from 'winston';
import path from 'path';
import { env } from '../config/env.config';

const logDir = 'logs';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
  })
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
});
