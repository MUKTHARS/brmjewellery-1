import api from './axiosInstance';

export const paymentApi = {
  // Single endpoint — method selects the payment flow on the backend
  process: (orderId: string, method: string) =>
    api.post('/payment/process', { orderId, method }),

  // Admin only
  refund: (orderId: string) =>
    api.post('/payment/refund', { orderId }),
};
