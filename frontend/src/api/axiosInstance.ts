import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor — attach access token from localStorage if available
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${API_BASE}/api/v1/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        if (typeof window !== 'undefined') localStorage.setItem('accessToken', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          const isAdminRoute = window.location.pathname.startsWith('/admin');
          window.location.href = isAdminRoute ? '/admin/login' : '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
