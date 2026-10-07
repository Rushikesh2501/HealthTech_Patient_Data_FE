import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './AppSidebar.module.css';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Activity,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../Avatar/Avatar';
import { ROUTES } from '../../utils/constants';

export interface AppSidebarProps {
  onCloseMobile?: () => void;
  className?: string;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  onCloseMobile,
  className = '',
}) => {
  const { user, logout, hasPermission } = useAuth();

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navItems = [
    {
      to: ROUTES.DASHBOARD,
      label: 'Dashboard',
      icon: <LayoutDashboard size={19} />,
      permission: null,
    },
    {
      to: ROUTES.PATIENTS,
      label: 'Patients',
      icon: <Users size={19} />,
      permission: 'patients.read' as const,
    },
    {
      to: ROUTES.ENCOUNTERS,
      label: 'Encounters',
      icon: <ClipboardList size={19} />,
      permission: 'encounters.read' as const,
    },
    {
      to: ROUTES.ANALYTICS,
      label: 'Analytics',
      icon: <BarChart3 size={19} />,
      permission: 'analytics.read' as const,
    },
  ];

  const adminNavItems = [
    {
      to: ROUTES.AUDIT_LOGS,
      label: 'Audit Logs',
      icon: <ShieldCheck size={19} />,
      permission: 'audit.read' as const,
    },
    {
      to: ROUTES.SETTINGS,
      label: 'Settings',
      icon: <Settings size={19} />,
      permission: 'settings.manage' as const,
    },
  ];

  return (
    <aside className={`${styles.sidebar} ${className}`.trim()} aria-label="Main Navigation">
      <div className={styles.brand}>
        <NavLink to={ROUTES.DASHBOARD} className={styles.brandLogo}>
          <div className={styles.logoIcon}>
            <Activity size={22} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>HealthTech</span>
            <span className={styles.brandSubtitle}>Patient Data Platform</span>
          </div>
        </NavLink>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className={styles.closeButton}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className={styles.navContainer}>
        <div className={styles.navSection}>
          <span className={styles.sectionHeader}>Menu</span>
          {navItems.map((item) => {
            if (item.permission && !hasPermission(item.permission)) {
              return null;
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
                }
              >
                <span className={styles.linkIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Admin section only rendered if user has at least one admin permission */}
        {adminNavItems.some((item) => hasPermission(item.permission)) && (
          <div className={styles.navSection}>
            <span className={styles.sectionHeader}>Administration</span>
            {adminNavItems.map((item) => {
              if (item.permission && !hasPermission(item.permission)) {
                return null;
              }
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
                  }
                >
                  <span className={styles.linkIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.userFooter}>
        <div className={styles.userInfo}>
          <Avatar name={user?.name || 'User'} size="sm" />
          <div className={styles.userMeta}>
            <span className={styles.userName} title={user?.name}>
              {user?.name || 'Authenticated User'}
            </span>
            <span className={styles.userRole}>
              {user?.role || 'Clinician'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className={styles.logoutButton}
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
