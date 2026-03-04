export interface CreatePaymentIntentInput {
  amount: number; // in pence
  currency: string;
  orderId: string;
  metadata?: Record<string, string>;
}

export interface PaymentConfirmation {
  paymentIntentId: string;
  status: string;
  amount: number;
  currency: string;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number; // partial refund in pence, omit for full refund
  reason?: string;
}
