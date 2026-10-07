import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from './Settings.module.css';
import { Shield, Server, Database, Key, KeyRound, Lock } from 'lucide-react';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton';
import { ChangePasswordModal } from '../../components/ChangePasswordModal';
import { useAuth } from '../../hooks/useAuth';
import { settingsApi } from './api';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { data: config } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSystemSettings(),
  });

  return (
    <PageContainer>
      <PageHeader
        title="System Settings"
        subtitle="Configure backend connectivity, security parameters, and role governance."
      />

      <div className={styles.cardGrid}>
        {/* Account Security & Password Management */}
        <div className={styles.securityCard}>
          <div className={styles.cardHeader}>
            <div
              className={styles.iconWrapper}
              style={{ backgroundColor: 'rgba(37, 99, 235, 0.12)', color: 'var(--color-primary)' }}
            >
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className={styles.title}>Account Security & Password Management</h3>
              <p className={styles.subtitle}>Manage authentication credentials and self-service password reset</p>
            </div>
          </div>
          <div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Authenticated User</span>
              <span className={styles.value}>
                {user?.name || 'Healthcare Practitioner'} ({user?.email || 'N/A'})
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Assigned Role</span>
              <span className={styles.value}>{user?.role ? user.role.toUpperCase() : 'USER'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Password Policy</span>
              <span className={styles.value}>Minimum 8 characters with auto-session invalidation</span>
            </div>
          </div>
          <div className={styles.securityActionRow}>
            <p className={styles.securityNote}>
              Need to update your temporary or existing password? You can securely reset it here. Note that
              resetting your password will automatically log you out and require you to sign in again with your
              new credentials.
            </p>
            <PrimaryButton
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              icon={<Lock size={16} />}
            >
              Change Password
            </PrimaryButton>
          </div>
        </div>

        {/* Backend Connectivity */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <Server size={20} />
            </div>
            <div>
              <h3 className={styles.title}>FastAPI Backend Service</h3>
              <p className={styles.subtitle}>Microservice API gateway configuration</p>
            </div>
          </div>
          <div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Endpoint URL</span>
              <span className={styles.value}>
                {config?.apiUrl || process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>API Status</span>
              <StatusBadge status="completed" label="Connected" />
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Protocol</span>
              <span className={styles.value}>RESTful JSON / OpenAPI 3.1</span>
            </div>
          </div>
        </div>

        {/* Database */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <Database size={20} />
            </div>
            <div>
              <h3 className={styles.title}>Database Architecture</h3>
              <p className={styles.subtitle}>Relational persistent store</p>
            </div>
          </div>
          <div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Database Engine</span>
              <span className={styles.value}>PostgreSQL 15+</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Anonymization</span>
              <StatusBadge status="completed" label="Active" />
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Cache Invalidation</span>
              <span className={styles.value}>TanStack Query Real-Time Refetch</span>
            </div>
          </div>
        </div>

        {/* Security & RBAC */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <Shield size={20} />
            </div>
            <div>
              <h3 className={styles.title}>Role-Based Access Control (RBAC)</h3>
              <p className={styles.subtitle}>Permission hierarchy and security policies</p>
            </div>
          </div>
          <div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Active Roles</span>
              <span className={styles.value}>SUPERADMIN, ADMIN, CLINICIAN, NURSE</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Authorization Engine</span>
              <span className={styles.value}>Centralized permissions.ts</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Audit Logging</span>
              <StatusBadge status="completed" label="Enforced" />
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <Key size={20} />
            </div>
            <div>
              <h3 className={styles.title}>JWT Authentication Architecture</h3>
              <p className={styles.subtitle}>Session management and token lifecycle</p>
            </div>
          </div>
          <div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Token Type</span>
              <span className={styles.value}>Bearer JWT (RS256 / HS256 ready)</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Session Expiry Guard</span>
              <span className={styles.value}>Axios 401 Interceptor</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Draft Preservation</span>
              <StatusBadge status="completed" label="Enabled" />
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </PageContainer>
  );
};

export default Settings;
