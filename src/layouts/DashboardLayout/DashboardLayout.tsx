import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styles from './DashboardLayout.module.css';
import { AppSidebar } from '../../components/AppSidebar/AppSidebar';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { ROUTES } from '../../utils/constants';

const getPageTitle = (pathname: string): string => {
  if (pathname === ROUTES.DASHBOARD) return 'Clinical Overview';
  if (pathname.startsWith('/patients/')) return 'Patient Details';
  if (pathname === ROUTES.PATIENTS) return 'Patient Directory';
  if (pathname === ROUTES.ENCOUNTERS) return 'Patient Encounters';
  if (pathname === ROUTES.ANALYTICS) return 'Clinical Analytics';
  if (pathname === ROUTES.USERS) return 'User Directory';
  if (pathname.startsWith('/audit-logs/')) return 'Audit Event Details';
  if (pathname === ROUTES.AUDIT_LOGS) return 'Security & Audit Logs';
  if (pathname === ROUTES.SETTINGS) return 'System Settings';
  return 'HealthTech Dashboard';
};

export const DashboardLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className={styles.layout}>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`${styles.drawerBackdrop} ${mobileMenuOpen ? styles.drawerBackdropActive : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar with responsive drawer class on mobile/tablet */}
      <div
        className={`${styles.sidebarDrawer} ${mobileMenuOpen ? styles.sidebarDrawerOpen : ''}`}
      >
        <AppSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
      </div>

      <div className={styles.mainWrapper}>
        <AppHeader
          title={title}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
