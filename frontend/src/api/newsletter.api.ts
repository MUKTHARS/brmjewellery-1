import api from './axiosInstance';

export const newsletterApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/newsletter', { params }),
  subscribe: (data: { email: string; firstName?: string; lastName?: string }) => api.post('/newsletter/subscribe', data),
  unsubscribe: (email: string) => api.post('/newsletter/unsubscribe', { email }),
};
