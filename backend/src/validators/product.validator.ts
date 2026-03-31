import { z } from 'zod';

const productAttributeSchema = z.object({
  fieldName: z.string().min(1),
  fieldLabel: z.string().min(1),
  value: z.string().min(1),
});

export const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  description: z.string().optional(),
  story: z.string().optional(),
  brand: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  metalType: z.enum(['GOLD', 'SILVER', 'PLATINUM']).optional(),
  metalColor: z.string().optional(),
  carat: z.string().optional(),
  gemstone: z.string().optional(),
  diamondShape: z.string().optional(),
  weightGrams: z.coerce.number().positive().optional(),
  baseCost: z.coerce.number().min(0, 'Base cost must be non-negative'),
  sku: z.string().min(1, 'SKU is required').max(50),
  isActive: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).default(true),
  stockQty: z.coerce.number().int().min(0).default(0),
  attributes: z.array(productAttributeSchema).default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  isActive: z.string().optional(),
  metalType: z.string().optional(),
  metalColor: z.string().optional(),
  carat: z.string().optional(),
  brand: z.string().optional(),
  gemstone: z.string().optional(),
  diamondShape: z.string().optional(),
  minWeight: z.string().optional(),
  maxWeight: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title', 'baseCost']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
