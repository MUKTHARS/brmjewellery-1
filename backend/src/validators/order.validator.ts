import { z } from 'zod';

export const updateOrderStatusSchema = z.object({
  fulfillmentStatus: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  paymentStatus: z.enum(['UNPAID', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  notes: z.string().optional(),
});

export const orderQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  userId: z.string().optional(),
  search: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sortBy: z.enum(['createdAt', 'totalGBP', 'orderNumber']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
