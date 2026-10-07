import { LoginCredentials, AuthResponse, User } from '../types/user';
import { STORAGE_KEYS } from '../utils/constants';
import { MOCK_USERS } from './mockData';

// Simulated latency helper
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(400);

    // Check against mock users
    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
    );

    if (!user) {
      // Allow any role selection or default to clinician if typed, else reject
      if (credentials.email.includes('admin')) {
        const adminUser = MOCK_USERS[0];
        const res: AuthResponse = {
          user: adminUser,
          token: 'mock-jwt-token-admin-xyz',
          refreshToken: 'mock-refresh-token-admin',
        };
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(res.user));
        return res;
      }
      throw new Error('Invalid email or password. Please try again.');
    }

    const token = `mock-jwt-token-${user.role}-${Date.now()}`;
    const res: AuthResponse = {
      user,
      token,
      refreshToken: `mock-refresh-token-${user.role}`,
    };

    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    return res;
  },

  async getCurrentUser(): Promise<User | null> {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    await delay(150);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  async refreshToken(): Promise<string> {
    await delay(200);
    const newToken = `mock-refreshed-token-${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
    return newToken;
  },
};
