import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/reports/sales', adminController.getSalesReport);
router.get('/reports/margins', adminController.getMarginReport);
router.get('/analytics/customers', adminController.getCustomerAnalytics);
router.get('/analytics/revenue-by-category', adminController.getRevenueByCategory);

export default router;
