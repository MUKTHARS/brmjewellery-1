import { Router } from 'express';
import * as newsletterController from '../controllers/newsletter.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.post('/subscribe', newsletterController.subscribe);
router.post('/unsubscribe', newsletterController.unsubscribe);
router.get('/subscribers', authenticate, requireAdmin, newsletterController.getSubscribers);

export default router;
