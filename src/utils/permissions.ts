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

const DYNAMIC_PERMISSIONS_KEY = 'pm_role_permissions';

export const getRolePermissions = (): Record<UserRole, Permission[]> => {
  try {
    const saved = localStorage.getItem(DYNAMIC_PERMISSIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...ROLE_PERMISSIONS,
        ...parsed,
        superadmin: ROLE_PERMISSIONS.superadmin, // superadmin always retains full access
      };
    }
  } catch (err) {
    console.error('Failed to parse role permissions:', err);
  }
  return { ...ROLE_PERMISSIONS };
};

export const saveRolePermissions = (newPermissions: Record<UserRole, Permission[]>): void => {
  try {
    const toSave = {
      ...newPermissions,
      superadmin: ROLE_PERMISSIONS.superadmin,
    };
    localStorage.setItem(DYNAMIC_PERMISSIONS_KEY, JSON.stringify(toSave));
    window.dispatchEvent(new CustomEvent('pm_permissions_updated'));
  } catch (err) {
    console.error('Failed to save role permissions:', err);
  }
};

export const resetRolePermissions = (): void => {
  try {
    localStorage.removeItem(DYNAMIC_PERMISSIONS_KEY);
    window.dispatchEvent(new CustomEvent('pm_permissions_updated'));
  } catch (err) {
    console.error('Failed to reset role permissions:', err);
  }
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
  const currentPermissions = getRolePermissions();
  const permissions = currentPermissions[userRole] || [];
  return permissions.includes(permission);
};

export const hasAnyPermission = (user: User | null | undefined, permissions: Permission[]): boolean => {
  if (!user) return false;
  return permissions.some((perm) => hasPermission(user, perm));
};
