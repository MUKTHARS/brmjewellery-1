import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(1000).optional(),
});

export const reviewQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  productId: z.string().optional(),
  rating: z.string().optional(),
  isVisible: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
