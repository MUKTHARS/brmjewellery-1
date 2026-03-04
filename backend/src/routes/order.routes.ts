import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateOrderStatusSchema, createOrderSchema } from '../validators/order.validator';

const router = Router();

// ── User routes (authenticated, any role) ───────────────────────────────────
router.post('/', authenticate, validate(createOrderSchema), orderController.createOrder);
router.get('/my', authenticate, orderController.getMyOrders);
router.get('/my/:id', authenticate, orderController.getMyOrderById);

// ── Admin routes ─────────────────────────────────────────────────────────────
router.get('/', authenticate, requireAdmin, orderController.getOrders);
router.get('/:id', authenticate, requireAdmin, orderController.getOrderById);
router.patch('/:id/status', authenticate, requireAdmin, validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
