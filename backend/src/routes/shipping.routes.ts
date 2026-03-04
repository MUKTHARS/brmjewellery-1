import { Router } from 'express';
import * as shippingController from '../controllers/shipping.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.post('/label/:orderId', requireAdmin, shippingController.generateLabel);
router.get('/tracking/:orderId', shippingController.getTrackingStatus);

export default router;
