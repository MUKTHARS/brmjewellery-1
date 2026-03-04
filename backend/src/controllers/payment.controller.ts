import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess, sendError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import { env } from '../config/env.config';
import * as paymentService from '../services/payment.service';

export const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.createPaymentIntent(req.body.orderId);
  sendSuccess(res, result, 'Payment intent created');
});

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  if (!sig) {
    sendError(res, 'Missing stripe-signature header', HTTP_STATUS.BAD_REQUEST);
    return;
  }
  await paymentService.handleStripeWebhook(req.body as Buffer, sig, env.STRIPE_WEBHOOK_SECRET);
  res.json({ received: true });
});

export const refundOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, amount, reason } = req.body;
  const amountPence = amount ? Math.round(amount * 100) : undefined;
  const refund = await paymentService.refundOrder(orderId, amountPence, reason);
  sendSuccess(res, refund, 'Refund processed');
});
