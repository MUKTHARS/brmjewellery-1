import { Router } from 'express';
import * as metalPriceController from '../controllers/metalPrice.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.get('/', metalPriceController.getCurrentPrices);
router.post('/refresh', authenticate, requireAdmin, metalPriceController.refreshPrices);

export default router;
