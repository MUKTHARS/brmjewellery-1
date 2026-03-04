import { Router } from 'express';
import * as bespokeController from '../controllers/bespoke.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { uploadBespokeImages } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateBespokeStatusSchema } from '../validators/bespoke.validator';

const router = Router();

// Public / user
router.post('/', uploadBespokeImages, bespokeController.submitEnquiry);

// Admin
router.get('/', authenticate, requireAdmin, bespokeController.getEnquiries);
router.get('/:id', authenticate, requireAdmin, bespokeController.getEnquiryById);
router.patch('/:id/status', authenticate, requireAdmin, validate(updateBespokeStatusSchema), bespokeController.updateEnquiryStatus);

export default router;
