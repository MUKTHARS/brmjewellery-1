import api from './axiosInstance';

export const userApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get('/users', { params }),

  getById: (id: string) =>
    api.get(`/users/${id}`),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/users/${id}`, data),

  getOrders: (id: string, params?: Record<string, string | number | undefined>) =>
    api.get(`/users/${id}/orders`, { params }),
};
