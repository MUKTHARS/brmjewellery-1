import api from './axiosInstance';

export const categoryApi = {
  getAll: (includeInactive = false) =>
    api.get('/categories', { params: { includeInactive } }),

  getById: (id: string) =>
    api.get(`/categories/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/categories', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/categories/${id}`, data),

  delete: (id: string) =>
    api.delete(`/categories/${id}`),

  getAttributeTemplate: (categoryId: string) =>
    api.get(`/categories/${categoryId}/attributes`),

  upsertAttributeTemplate: (categoryId: string, attributes: unknown[]) =>
    api.put(`/categories/${categoryId}/attributes`, { attributes }),
};
