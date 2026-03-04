import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCategorySchema, updateCategorySchema, upsertAttributeTemplateSchema } from '../validators/category.validator';

const router = Router();

// Public
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/attributes', categoryController.getAttributeTemplate);

// Admin
router.post('/', authenticate, requireAdmin, validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', authenticate, requireAdmin, validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, categoryController.deleteCategory);
router.put('/:id/attributes', authenticate, requireAdmin, validate(upsertAttributeTemplateSchema), categoryController.upsertAttributeTemplate);

export default router;
