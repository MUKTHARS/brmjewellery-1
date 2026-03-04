import api from './axiosInstance';

export const appointmentApi = {
  create: (data: Record<string, string | undefined>) =>
    api.post('/appointments', data),
  getAll: (params?: Record<string, string | undefined>) =>
    api.get('/appointments', { params }),

  getById: (id: string) =>
    api.get(`/appointments/${id}`),

  update: (id: string, data: Record<string, string | undefined>) =>
    api.patch(`/appointments/${id}`, data),

  cancel: (id: string) =>
    api.delete(`/appointments/${id}/cancel`),
};
