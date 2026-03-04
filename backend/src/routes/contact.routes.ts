import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.post('/', contactController.submitContactForm);
router.get('/', authenticate, requireAdmin, contactController.getContactMessages);
router.patch('/:id/read', authenticate, requireAdmin, contactController.markContactRead);
router.delete('/:id', authenticate, requireAdmin, contactController.deleteContactMessage);

export default router;
