import api from './axiosInstance';

export const orderApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get('/orders', { params }),

  getById: (id: string) =>
    api.get(`/orders/${id}`),

  updateStatus: (id: string, data: Record<string, string>) =>
    api.patch(`/orders/${id}/status`, data),
};
