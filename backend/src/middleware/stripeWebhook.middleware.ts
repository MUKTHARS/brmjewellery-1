import { Request, Response, NextFunction } from 'express';
import express from 'express';

// Stripe requires the raw body for webhook signature verification
export const stripeWebhookMiddleware = [
  express.raw({ type: 'application/json' }),
  (_req: Request, _res: Response, next: NextFunction) => next(),
];
