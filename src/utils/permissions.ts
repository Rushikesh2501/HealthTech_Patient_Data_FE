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
  | 'settings.manage'
  | 'rbac.manage';

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
    'rbac.manage',
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

export const isSuperAdmin = (user: User | null | undefined): boolean => {
  if (!user || !user.role) return false;
  return String(user.role).toLowerCase() === 'superadmin';
};

export const hasRole = (user: User | null | undefined, roles: UserRole | UserRole[]): boolean => {
  if (!user || !user.role) return false;
  const userRole = String(user.role).toLowerCase();
  const roleArray = (Array.isArray(roles) ? roles : [roles]).map((r) => String(r).toLowerCase());

  // If the check specifically targets superadmin, only superadmin qualifies
  if (roleArray.includes('superadmin')) {
    return userRole === 'superadmin';
  }

  // Superadmin inherently qualifies for all other role checks
  if (userRole === 'superadmin') return true;

  return roleArray.includes(userRole);
};

export const hasPermission = (user: User | null | undefined, permission: Permission): boolean => {
  if (!user || !user.role) return false;
  const userRole = String(user.role).toLowerCase() as UserRole;
  if (userRole === 'superadmin') return true;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

export const hasAnyPermission = (user: User | null | undefined, permissions: Permission[]): boolean => {
  if (!user) return false;
  return permissions.some((perm) => hasPermission(user, perm));
};
