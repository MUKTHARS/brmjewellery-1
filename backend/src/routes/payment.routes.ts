import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

// All payment methods use a single endpoint — method string selects the flow
router.post('/process', authenticate, paymentController.processPayment);
router.post('/refund', authenticate, requireAdmin, paymentController.refundOrder);

export default router;
