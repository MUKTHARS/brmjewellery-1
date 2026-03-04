import { Router } from 'express';
import * as invoiceController from '../controllers/invoice.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.post('/order/:orderId', requireAdmin, invoiceController.generateInvoice);
router.get('/order/:orderId', invoiceController.getInvoiceByOrder);
router.get('/order/:orderId/download', invoiceController.downloadInvoice);

export default router;
