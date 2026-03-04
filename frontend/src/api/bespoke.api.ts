import api from './axiosInstance';

export const bespokeApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get('/bespoke', { params }),

  getById: (id: string) =>
    api.get(`/bespoke/${id}`),

  updateStatus: (id: string, data: Record<string, unknown>) =>
    api.patch(`/bespoke/${id}/status`, data),
};
