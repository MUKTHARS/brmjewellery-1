import api from './axiosInstance';

export const metalPriceApi = {
  getCurrent: () => api.get('/metal-prices'),
  refresh: () => api.post('/metal-prices/refresh'),
};
