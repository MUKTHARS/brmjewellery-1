import api from './axiosInstance';

export const productApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get('/products', { params }),

  getById: (id: string) =>
    api.get(`/products/${id}`),

  getBySlug: (slug: string) =>
    api.get(`/products/slug/${slug}`),

  create: (formData: FormData) =>
    api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  update: (id: string, formData: FormData) =>
    api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  delete: (id: string) =>
    api.delete(`/products/${id}`),

  deleteImage: (productId: string, imageId: string) =>
    api.delete(`/products/${productId}/images/${imageId}`),

  setPrimaryImage: (productId: string, imageId: string) =>
    api.patch(`/products/${productId}/images/${imageId}/primary`),

  // Variant management (admin)
  createVariant: (productId: string, data: Record<string, unknown>) =>
    api.post(`/products/${productId}/variants`, data),

  updateVariant: (productId: string, variantId: string, data: Record<string, unknown>) =>
    api.put(`/products/${productId}/variants/${variantId}`, data),

  deleteVariant: (productId: string, variantId: string) =>
    api.delete(`/products/${productId}/variants/${variantId}`),
};
