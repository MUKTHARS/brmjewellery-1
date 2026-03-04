export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

export type AppointmentStatusType = (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export const APPOINTMENT_TYPES = {
  BESPOKE_CONSULTATION: 'Bespoke Consultation',
  VIEWING: 'Viewing',
  COLLECTION: 'Collection',
} as const;
