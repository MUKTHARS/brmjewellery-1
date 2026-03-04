import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', reviewController.getReviews);
router.patch('/:id/visibility', reviewController.toggleVisibility);
router.delete('/:id', reviewController.deleteReview);

export default router;
