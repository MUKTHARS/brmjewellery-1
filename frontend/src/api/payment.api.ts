import api from './axiosInstance';

export const paymentApi = {
  createIntent: (orderId: string) =>
    api.post('/payment/create-intent', { orderId }),
  refund: (orderId: string, amount?: number, reason?: string) =>
    api.post('/payment/refund', { orderId, amount, reason }),
};
