import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import orderRoutes from './order.routes';
import bespokeRoutes from './bespoke.routes';
import appointmentRoutes from './appointment.routes';
import paymentRoutes from './payment.routes';
import metalPriceRoutes from './metalPrice.routes';
import invoiceRoutes from './invoice.routes';
import reviewRoutes from './review.routes';
import adminRoutes from './admin.routes';
import newsletterRoutes from './newsletter.routes';
import contactRoutes from './contact.routes';
import shippingRoutes from './shipping.routes';
import botRoutes from './bot.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/bespoke', bespokeRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/payment', paymentRoutes);
router.use('/metal-prices', metalPriceRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/contact', contactRoutes);
router.use('/shipping', shippingRoutes);
router.use('/bot', botRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'BRM Jewellery API' });
});

export default router;
