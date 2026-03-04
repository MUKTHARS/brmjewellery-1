import api from './axiosInstance';

export const userOrderApi = {
  create: (data: {
    items: { productId: string; quantity: number }[];
    shippingAddress: { line1: string; line2?: string; city: string; county?: string; postcode: string; country?: string };
    deliveryMethod: string;
    notes?: string;
  }) => api.post('/orders', data),

  getAll: (params?: Record<string, unknown>) => api.get('/orders/my', { params }),
  getById: (id: string) => api.get(`/orders/my/${id}`),
};
