import { z } from 'zod';

const ukPhoneRegex = /^(\+44|0)[1-9]\d{9}$/;

export const createAppointmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(ukPhoneRegex, 'Invalid UK phone number'),
  appointmentType: z.enum(['Bespoke Consultation', 'Viewing', 'Collection']),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  date: z.string().optional(),
  adminNotes: z.string().optional(),
});

export const appointmentQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
