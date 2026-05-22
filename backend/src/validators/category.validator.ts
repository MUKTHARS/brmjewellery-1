import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().optional().nullable().or(z.literal('')),
  description: z.string().optional().nullable().or(z.literal('')),
  parentId: z.string().optional().nullable().or(z.literal('')),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

const attributeFieldSchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().min(1),
  label: z.string().min(1),
  fieldType: z.enum(['TEXT', 'NUMBER', 'SELECT', 'BOOLEAN', 'DECIMAL']),
  options: z.array(z.string()).default([]),
  isRequired: z.boolean().default(false),
  isFilterable: z.boolean().default(true),
  unit: z.string().optional().nullable().or(z.literal('')),
  placeholder: z.string().optional().nullable().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

export const upsertAttributeTemplateSchema = z.object({
  attributes: z.array(attributeFieldSchema),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpsertAttributeTemplateInput = z.infer<typeof upsertAttributeTemplateSchema>;
