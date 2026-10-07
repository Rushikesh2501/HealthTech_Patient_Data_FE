import { User, UserRole } from '../types/user';

export type Permission =
  | 'patients.read'
  | 'patients.create'
  | 'patients.update'
  | 'patients.delete'
  | 'encounters.read'
  | 'encounters.create'
  | 'encounters.update'
  | 'encounters.delete'
  | 'analytics.read'
  | 'audit.read'
  | 'settings.manage';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  superadmin: [
    'patients.read',
    'patients.create',
    'patients.update',
    'patients.delete',
    'encounters.read',
    'encounters.create',
    'encounters.update',
    'encounters.delete',
    'analytics.read',
    'audit.read',
    'settings.manage',
  ],
  admin: [
    'patients.read',
    'patients.create',
    'patients.update',
    'patients.delete',
    'encounters.read',
    'encounters.create',
    'encounters.update',
    'encounters.delete',
    'analytics.read',
    'audit.read',
    'settings.manage',
  ],
  clinician: [
    'patients.read',
    'encounters.read',
    'encounters.create',
    'encounters.update',
    'analytics.read',
  ],
  nurse: [
    'patients.read',
    'encounters.read',
    'encounters.create',
    'encounters.update',
  ],
};

export const hasRole = (user: User | null | undefined, roles: UserRole | UserRole[]): boolean => {
  if (!user) return false;
  if (user.role === 'superadmin') return true;
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
};

export const hasPermission = (user: User | null | undefined, permission: Permission): boolean => {
  if (!user) return false;
  if (user.role === 'superadmin') return true;
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.includes(permission);
};

export const hasAnyPermission = (user: User | null | undefined, permissions: Permission[]): boolean => {
  if (!user) return false;
  return permissions.some((perm) => hasPermission(user, perm));
};
