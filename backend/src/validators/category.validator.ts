import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

const attributeFieldSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  label: z.string().min(1),
  fieldType: z.enum(['TEXT', 'NUMBER', 'SELECT', 'BOOLEAN', 'DECIMAL']),
  options: z.array(z.string()).default([]),
  isRequired: z.boolean().default(false),
  isFilterable: z.boolean().default(true),
  unit: z.string().optional(),
  placeholder: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const upsertAttributeTemplateSchema = z.object({
  attributes: z.array(attributeFieldSchema),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpsertAttributeTemplateInput = z.infer<typeof upsertAttributeTemplateSchema>;
