import api from './axiosInstance';

export const adminApi = {
  getDashboardStats: () =>
    api.get('/admin/dashboard'),

  getSalesReport: (params?: { period?: string; from?: string; to?: string }) =>
    api.get('/admin/reports/sales', { params }),

  getMarginReport: (params?: { period?: string; from?: string; to?: string }) =>
    api.get('/admin/reports/margins', { params }),

  getCustomerAnalytics: (params?: Record<string, unknown>) =>
    api.get('/admin/analytics/customers', { params }),

  getRevenueByCategory: (params?: { period?: string; from?: string; to?: string }) =>
    api.get('/admin/analytics/revenue-by-category', { params }),
};
