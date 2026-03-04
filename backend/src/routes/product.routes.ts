import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { uploadProductImages } from '../middleware/upload.middleware';

const router = Router();

// Public
router.get('/', productController.getProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);

// Admin
router.post('/', authenticate, requireAdmin, uploadProductImages, productController.createProduct);
router.put('/:id', authenticate, requireAdmin, uploadProductImages, productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);
router.delete('/:id/images/:imageId', authenticate, requireAdmin, productController.deleteProductImage);
router.patch('/:id/images/:imageId/primary', authenticate, requireAdmin, productController.setPrimaryImage);

export default router;
