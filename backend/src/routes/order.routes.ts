import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateOrderStatusSchema } from '../validators/order.validator';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
