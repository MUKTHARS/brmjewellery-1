import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { ERROR_MESSAGES } from '../constants/errorMessages.constants';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3000, // supports high production traffic
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, ERROR_MESSAGES.TOO_MANY_REQUESTS, HTTP_STATUS.TOO_MANY_REQUESTS);
  },
});

// Lenient limiter for high-frequency authenticated endpoints (e.g. /auth/me)
export const meLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, ERROR_MESSAGES.TOO_MANY_REQUESTS, HTTP_STATUS.TOO_MANY_REQUESTS);
  },
});

// Applied to login — stricter to prevent brute force
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 'Too many login attempts. Please try again in 15 minutes.', HTTP_STATUS.TOO_MANY_REQUESTS);
  },
});

// Applied to register — more lenient, users may retry with different passwords
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 'Too many registration attempts. Please try again in 1 hour.', HTTP_STATUS.TOO_MANY_REQUESTS);
  },
});

export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  handler: (_req, res) => {
    sendError(res, 'Too many password reset attempts. Please try again in 1 hour.', HTTP_STATUS.TOO_MANY_REQUESTS);
  },
});
