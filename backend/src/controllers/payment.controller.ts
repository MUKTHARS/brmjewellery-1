import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess, sendError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import * as paymentService from '../services/payment.service';

// ── Process payment ────────────────────────────────────────────────────────────
// Accepts any payment method string: visa | mastercard | apple_pay |
//   klarna | clearpay | bank_transfer

export const processPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, method } = req.body;
  if (!orderId || !method) {
    sendError(res, 'orderId and method are required', HTTP_STATUS.BAD_REQUEST);
    return;
  }
  const result = await paymentService.processPayment(orderId, method);
  sendSuccess(res, result, result.pending ? 'Payment pending — instructions sent by email' : 'Payment confirmed');
});

// ── Refund ─────────────────────────────────────────────────────────────────────

export const refundOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const result = await paymentService.refundOrder(orderId);
  sendSuccess(res, result, 'Refund processed');
});
