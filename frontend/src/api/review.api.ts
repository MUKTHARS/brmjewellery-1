import api from './axiosInstance';

export const reviewApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get('/reviews', { params }),

  toggleVisibility: (id: string, isVisible: boolean) =>
    api.patch(`/reviews/${id}/visibility`, { isVisible }),

  delete: (id: string) =>
    api.delete(`/reviews/${id}`),
};
