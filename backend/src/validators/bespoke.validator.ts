import { z } from 'zod';

const ukPhoneRegex = /^(\+44|0)[1-9]\d{9}$/;

export const createBespokeEnquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(ukPhoneRegex, 'Invalid UK phone number'),
  metalType: z.string().optional(),
  carat: z.string().optional(),
  description: z.string().min(10, 'Please provide more detail (at least 10 characters)'),
  budgetGBP: z.number().positive().optional(),
  preferredDate: z.string().optional(),
});

export const updateBespokeStatusSchema = z.object({
  status: z.enum(['NEW', 'IN_REVIEW', 'QUOTED', 'CONFIRMED', 'COMPLETED']),
  adminNotes: z.string().optional(),
  quotedPriceGBP: z.number().positive().optional(),
});

export const bespokeQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export type CreateBespokeEnquiryInput = z.infer<typeof createBespokeEnquirySchema>;
export type UpdateBespokeStatusInput = z.infer<typeof updateBespokeStatusSchema>;
