import api from './axiosInstance';

export const invoiceApi = {
  generate: (orderId: string) => api.post(`/invoices/order/${orderId}`),
  getByOrder: (orderId: string) => api.get(`/invoices/order/${orderId}`),
  downloadUrl: (orderId: string) =>
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/invoices/order/${orderId}/download`,
};
