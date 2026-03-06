import api from './axiosInstance';

export const contactApi = {
  submit: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
    api.post('/contact', data),
  getAll: (params?: Record<string, unknown>) => api.get('/contact', { params }),
  getById: (id: string) => api.get(`/contact/${id}`),
  markRead: (id: string) => api.patch(`/contact/${id}/read`),
  delete: (id: string) => api.delete(`/contact/${id}`),
};
