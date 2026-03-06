import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.utils';
import { sendSuccess, sendError } from '../utils/apiResponse.utils';
import { HTTP_STATUS } from '../constants/httpStatus.constants';
import * as paymentService from '../services/payment.service';

// ── Simple process (cards / apple_pay / google_pay / bank_transfer) ────────────

export const processPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, method } = req.body;
  if (!orderId || !method) { sendError(res, 'orderId and method are required', HTTP_STATUS.BAD_REQUEST); return; }
  const result = await paymentService.processPayment(orderId, method);
  sendSuccess(res, result, result.pending ? 'Payment pending — instructions sent by email' : 'Payment confirmed');
});

// ── PayPal ─────────────────────────────────────────────────────────────────────

export const createPayPalOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;
  if (!orderId) { sendError(res, 'orderId is required', HTTP_STATUS.BAD_REQUEST); return; }
  const result = await paymentService.createPayPalOrder(orderId);
  sendSuccess(res, result, 'PayPal order created');
});

export const capturePayPalOrder = asyncHandler(async (req: Request, res: Response) => {
  const { paypalOrderId } = req.body;
  if (!paypalOrderId) { sendError(res, 'paypalOrderId is required', HTTP_STATUS.BAD_REQUEST); return; }
  const result = await paymentService.capturePayPalOrder(paypalOrderId);
  sendSuccess(res, result, 'PayPal payment captured');
});

// ── Klarna ─────────────────────────────────────────────────────────────────────

export const createKlarnaSession = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;
  if (!orderId) { sendError(res, 'orderId is required', HTTP_STATUS.BAD_REQUEST); return; }
  const result = await paymentService.createKlarnaSession(orderId);
  sendSuccess(res, result, 'Klarna session created');
});

export const authorizeKlarna = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, authorizationToken } = req.body;
  if (!orderId || !authorizationToken) { sendError(res, 'orderId and authorizationToken are required', HTTP_STATUS.BAD_REQUEST); return; }
  const result = await paymentService.authorizeKlarna(orderId, authorizationToken);
  sendSuccess(res, result, 'Klarna payment confirmed');
});

// ── Clearpay / Afterpay ────────────────────────────────────────────────────────

export const createClearpayCheckout = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;
  if (!orderId) { sendError(res, 'orderId is required', HTTP_STATUS.BAD_REQUEST); return; }
  const result = await paymentService.createClearpayCheckout(orderId);
  sendSuccess(res, result, 'Clearpay checkout created');
});

export const confirmClearpay = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, orderToken, status } = req.body;
  if (!orderId || !orderToken || !status) { sendError(res, 'orderId, orderToken and status are required', HTTP_STATUS.BAD_REQUEST); return; }
  const result = await paymentService.confirmClearpay(orderId, orderToken, status);
  sendSuccess(res, result, 'Clearpay payment confirmed');
});

// ── Refund ─────────────────────────────────────────────────────────────────────

export const refundOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const result = await paymentService.refundOrder(orderId);
  sendSuccess(res, result, 'Refund processed');
});
