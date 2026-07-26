import axios from 'axios';

const fallbackBaseURL = import.meta.env.PROD
  ? 'https://shophub-ecbr.onrender.com/api'
  : 'http://localhost:5000/api';

const normalizeBaseURL = (value) => {
  const raw = (value || fallbackBaseURL).trim();
  const trimmed = raw.replace(/\/+$/, '');

  if (trimmed.endsWith('/api')) {
    return `${trimmed}/`;
  }

  if (trimmed.endsWith('/auth') || trimmed.endsWith('/products') || trimmed.endsWith('/cart') || trimmed.endsWith('/orders') || trimmed.endsWith('/users') || trimmed.endsWith('/wishlist')) {
    return `${trimmed}/`;
  }

  return `${trimmed}/api/`;
};

const resolveApiBaseURL = () => {
  const configuredValue = import.meta.env.VITE_API_URL;

  if (import.meta.env.PROD) {
    const isLocalValue = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(configuredValue || '');
    return normalizeBaseURL(isLocalValue ? fallbackBaseURL : configuredValue || fallbackBaseURL);
  }

  return normalizeBaseURL(configuredValue || fallbackBaseURL);
};

const API_URL = resolveApiBaseURL();

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
