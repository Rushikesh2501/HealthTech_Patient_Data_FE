export type UserRole = 'superadmin' | 'admin' | 'clinician' | 'nurse';

export interface User {
  id: number | string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
  avatarUrl?: string;
  designation?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  designation?: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
