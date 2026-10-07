import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, LoginCredentials, UserRole } from '../types/user';
import { loginApi } from '../pages/Login/api';
import { STORAGE_KEYS } from '../utils/constants';
import { Permission, hasRole as checkRole, hasPermission as checkPermission } from '../utils/permissions';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpiredMessage: string | null;
  isSuperAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  clearSessionExpiredMessage: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          const currentUser = await loginApi.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for session expiry from axios interceptor
    const handleSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      setUser(null);
      setSessionExpiredMessage(customEvent.detail?.message || 'Your session has expired. Please log in again.');
    };

    const handlePermissionsUpdated = () => {
      setPermissionsRevision((prev) => prev + 1);
    };

    window.addEventListener('pm_session_expired', handleSessionExpired);
    window.addEventListener('pm_permissions_updated', handlePermissionsUpdated);
    return () => {
      window.removeEventListener('pm_session_expired', handleSessionExpired);
      window.removeEventListener('pm_permissions_updated', handlePermissionsUpdated);
    };
  }, []);

  const [permissionsRevision, setPermissionsRevision] = useState<number>(0);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    setSessionExpiredMessage(null);
    try {
      const res = await loginApi.login(credentials);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await loginApi.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSessionExpiredMessage = useCallback(() => {
    setSessionExpiredMessage(null);
  }, []);

  const userHasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      return checkRole(user, role);
    },
    [user]
  );

  const userHasPermission = useCallback(
    (permission: Permission) => {
      // Consume permissionsRevision to force recalculation on dynamic permission updates
      if (permissionsRevision < 0) return false;
      return checkPermission(user, permission);
    },
    [user, permissionsRevision]
  );

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    sessionExpiredMessage,
    isSuperAdmin: Boolean(user?.role && String(user.role).toLowerCase() === 'superadmin'),
    login,
    logout,
    clearSessionExpiredMessage,
    hasRole: userHasRole,
    hasPermission: userHasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
