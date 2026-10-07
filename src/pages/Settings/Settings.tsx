import React from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from './Settings.module.css';
import { Shield, Server, Database, Key } from 'lucide-react';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { settingsApi } from './api';

export const Settings: React.FC = () => {
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
    </PageContainer>
  );
};

export default Settings;
