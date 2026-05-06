import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

// Public
router.get('/', reviewController.getReviews);

// Admin only
router.patch('/:id/visibility', authenticate, requireAdmin, reviewController.toggleVisibility);
router.delete('/:id', authenticate, requireAdmin, reviewController.deleteReview);

export default router;
