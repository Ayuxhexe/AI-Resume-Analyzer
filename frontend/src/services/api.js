import axios from 'axios';
import { AUTH_STORAGE_KEY } from './storageKeys.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

    if (storedAuth) {
      const { token } = JSON.parse(storedAuth);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (_error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  return config;
});

export const extractApiErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong.';

export const buildAssetUrl = (fileUrl = '') => {
  if (!fileUrl) {
    return '';
  }

  if (fileUrl.startsWith('http')) {
    return fileUrl;
  }

  return `${import.meta.env.VITE_SERVER_URL || ''}${fileUrl}`;
};

export default api;
