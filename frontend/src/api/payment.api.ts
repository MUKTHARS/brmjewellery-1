import api from './axiosInstance';

export const paymentApi = {
  refund: (orderId: string, amount?: number, reason?: string) =>
    api.post('/payment/refund', { orderId, amount, reason }),
};
