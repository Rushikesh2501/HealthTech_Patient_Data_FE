import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS } from '../utils/constants';

const getBaseURL = () => {
  const envUrl = process.env.REACT_APP_API_URL?.trim();
  if (!envUrl) return 'http://localhost:8000/api/v1';
  const clean = envUrl.replace(/\/+$/, '');
  if (!clean.endsWith('/api/v1') && !clean.endsWith('/api')) {
    return `${clean}/api/v1`;
  }
  return clean;
};

const baseURL = getBaseURL();

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor for JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for 401 and error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        // Clear auth tokens
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);

        // Dispatch a custom event so the UI/AuthContext can react without hard-reloading
        window.dispatchEvent(
          new CustomEvent('pm_session_expired', {
            detail: { message: 'Your session has expired. Please log in again.' },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
