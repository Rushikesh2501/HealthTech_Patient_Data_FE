import apiClient from '../../../services/api';
import { LoginCredentials, AuthResponse, User } from '../../../types/user';
import { STORAGE_KEYS } from '../../../utils/constants';

export const loginApi = {
  /**
   * Authenticate user credentials directly with FastAPI
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const res = await apiClient.post<any>('/auth/login', credentials);
      const data = res.data;
      const token = data.access_token || data.token;
      const user: User = data.user;
      const refreshToken = data.refresh_token || data.refreshToken;

      if (token && user) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        if (refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
        return { user, token, refreshToken };
      }
      throw new Error('Invalid response structure received from authentication service.');
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        throw new Error(err.response.data.error.message);
      }
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
      }
      if (err.message) {
        throw new Error(err.message);
      }
      throw new Error('Authentication failed. Please check your credentials or network connection.');
    }
  },

  /**
   * Terminate authenticated session
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  },

  /**
   * Retrieve active session user directly from FastAPI /auth/me
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) return null;
      const res = await apiClient.get<User>('/auth/me');
      return res.data;
    } catch {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      return null;
    }
  },

  /**
   * Change password and invalidate active session tokens
   */
  async changePassword(data: {
    old_password?: string;
    oldPassword?: string;
    new_password?: string;
    newPassword?: string;
  }): Promise<{ message: string }> {
    try {
      const res = await apiClient.post<{ message: string }>('/auth/change-password', {
        old_password: data.old_password || data.oldPassword,
        new_password: data.new_password || data.newPassword,
      });
      return res.data;
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        throw new Error(err.response.data.error.message);
      }
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
      }
      if (err.message) {
        throw new Error(err.message);
      }
      throw new Error('Failed to update password. Please check your current password.');
    }
  },
};

export default loginApi;
