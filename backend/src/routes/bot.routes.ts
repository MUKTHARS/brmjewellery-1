import { Router } from 'express';
import * as productController from '../controllers/product.controller';

const router = Router();

// Agent/bot endpoints for product discovery
router.get('/products', productController.getProducts);
router.get('/products/slug/:slug', productController.getProductBySlug);
router.get('/products/:id', productController.getProductById);

export default router;
