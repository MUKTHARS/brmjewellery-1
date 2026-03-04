export const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export type PaymentStatusType = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
