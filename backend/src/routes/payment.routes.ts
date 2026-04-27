import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

// Simple flow: apple_pay / google_pay / bank_transfer
router.post('/process', authenticate, paymentController.processPayment);

// Stripe card payments (visa / mastercard)
router.post('/stripe/create-intent', authenticate, paymentController.createStripePaymentIntent);
// Note: /stripe/webhook is mounted directly in app.ts (before JSON parser) for raw body access

// PayPal
router.post('/paypal/create-order', authenticate, paymentController.createPayPalOrder);
router.post('/paypal/capture', authenticate, paymentController.capturePayPalOrder);

// Klarna
router.post('/klarna/session', authenticate, paymentController.createKlarnaSession);
router.post('/klarna/authorize', authenticate, paymentController.authorizeKlarna);

// Clearpay / Afterpay
router.post('/clearpay/checkout', authenticate, paymentController.createClearpayCheckout);
router.post('/clearpay/confirm', authenticate, paymentController.confirmClearpay);

// Admin
router.post('/refund', authenticate, requireAdmin, paymentController.refundOrder);

export default router;
