import api from './axiosInstance';

export const paypalApi = {
  createOrder: (orderId: string) =>
    api.post('/payment/paypal/create-order', { orderId }),

  captureOrder: (paypalOrderId: string) =>
    api.post('/payment/paypal/capture', { paypalOrderId }),
};
