import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  orderId: z.string().min(1),
});

export const refundOrderSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
});
