import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import express from 'express';

const router = Router();

// Stripe webhook — raw body required
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

// Stripe — authenticated
router.post('/create-intent', authenticate, paymentController.createPaymentIntent);
router.post('/refund', authenticate, requireAdmin, paymentController.refundOrder);

// PayPal — authenticated
router.post('/paypal/create-order', authenticate, paymentController.createPaypalOrder);
router.post('/paypal/capture', authenticate, paymentController.capturePaypalOrder);

export default router;
