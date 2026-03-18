  import api from './axiosInstance';

  export const paymentApi = {
    // Simple flow: visa | mastercard | apple_pay | google_pay | bank_transfer
    process: (orderId: string, method: string) =>
      api.post('/payment/process', { orderId, method }),

    // Klarna
    createKlarnaSession: (orderId: string) =>
      api.post('/payment/klarna/session', { orderId }),
    authorizeKlarna: (orderId: string, authorizationToken: string) =>
      api.post('/payment/klarna/authorize', { orderId, authorizationToken }),

    // Clearpay / Afterpay
    createClearpayCheckout: (orderId: string) =>
      api.post('/payment/clearpay/checkout', { orderId }),
    confirmClearpay: (orderId: string, orderToken: string, status: string) =>
      api.post('/payment/clearpay/confirm', { orderId, orderToken, status }),

    // Admin only
    refund: (orderId: string) =>
      api.post('/payment/refund', { orderId }),
  };
