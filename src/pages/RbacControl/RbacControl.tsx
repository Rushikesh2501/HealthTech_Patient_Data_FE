import React from 'react';
import styles from './RbacControl.module.css';
import { ShieldCheck, Check, Minus } from 'lucide-react';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_PERMISSIONS, Permission } from '../../utils/permissions';
import { UserRole } from '../../types/user';

interface MatrixRow {
  label: string;
  key: Permission;
  resource: string;
}

const MATRIX_ROWS: MatrixRow[] = [
  { label: 'View Anonymized Patients', key: 'patients.read', resource: 'Patients Directory' },
  { label: 'Register New Patient', key: 'patients.create', resource: 'Patients Directory' },
  { label: 'Update Patient Records', key: 'patients.update', resource: 'Patients Directory' },
  { label: 'Delete Patient Records', key: 'patients.delete', resource: 'Patients Directory' },
  { label: 'List Clinical Encounters', key: 'encounters.read', resource: 'Encounters' },
  { label: 'Record Clinical Encounter', key: 'encounters.create', resource: 'Encounters' },
  { label: 'Update Encounter Vitals', key: 'encounters.update', resource: 'Encounters' },
  { label: 'Delete Encounter Record', key: 'encounters.delete', resource: 'Encounters' },
  { label: 'Epidemiological Trends & AI', key: 'analytics.read', resource: 'Analytics' },
  { label: 'Immutable Audit Trail', key: 'audit.read', resource: 'Audit Logs' },
  { label: 'System & Gateway Config', key: 'settings.manage', resource: 'Settings' },
  { label: 'RBAC Policy Governance', key: 'rbac.manage', resource: 'Security Engine' },
];

const ROLES: { id: UserRole; label: string; badgeClass: string }[] = [
  { id: 'superadmin', label: 'SUPERADMIN', badgeClass: styles.roleBadgeSuperadmin },
  { id: 'admin', label: 'ADMIN', badgeClass: styles.roleBadgeAdmin },
  { id: 'clinician', label: 'CLINICIAN', badgeClass: styles.roleBadgeClinician },
  { id: 'nurse', label: 'NURSE', badgeClass: styles.roleBadgeNurse },
];

export const RbacControl: React.FC = () => {
  const { user } = useAuth();

  return (
    <PageContainer>
      <PageHeader
        title="RBAC Control & Security Governance"
        subtitle="SuperAdmin restricted management console for clinical roles, capability matrix, and security policies."
      />

      <div className={styles.container}>
        {/* SuperAdmin Authority Banner */}
        <div className={styles.clearanceBanner}>
          <div className={styles.clearanceLeft}>
            <div className={styles.shieldIcon}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h2 className={styles.clearanceTitle}>SuperAdmin Security Authority Active</h2>
              <p className={styles.clearanceSubtitle}>
                Authenticated Operator: <strong>{user?.name}</strong> ({user?.email}) • Full system governance and override authority enabled.
              </p>
            </div>
          </div>
          <span className={styles.badgeSuper}>Clearance: Level 0 (Root)</span>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Configured Roles</span>
            <span className={styles.statValue}>4</span>
            <span className={styles.statHint}>SuperAdmin, Admin, Clinician, Nurse</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Governed Capabilities</span>
            <span className={styles.statValue}>12</span>
            <span className={styles.statHint}>Granular clinical & admin permissions</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Enforcement Model</span>
            <span className={styles.statValue}>RBAC</span>
            <span className={styles.statHint}>Zero-trust least-privilege architecture</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Policy Integrity</span>
            <span className={styles.statValue}>Strict</span>
            <span className={styles.statHint}>Enforced at route & database layers</span>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className={styles.matrixCard}>
          <div className={styles.matrixHeader}>
            <div>
              <h3 className={styles.matrixTitle}>Clinical Capability & Access Matrix</h3>
              <p className={styles.matrixSubtitle}>
                Evaluation of active permission grants across all clinical user roles.
              </p>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.matrixTable}>
              <thead>
                <tr>
                  <th>Permission Capability</th>
                  <th>Protected Resource</th>
                  {ROLES.map((r) => (
                    <th key={r.id} className={styles.centerCol}>
                      <span className={r.badgeClass}>{r.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX_ROWS.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <span className={styles.permName}>{row.label}</span>
                      <span className={styles.permKey}>{row.key}</span>
                    </td>
                    <td>{row.resource}</td>
                    {ROLES.map((r) => {
                      const hasPerm = ROLE_PERMISSIONS[r.id].includes(row.key);
                      return (
                        <td key={r.id} className={styles.centerCol}>
                          {hasPerm ? (
                            <span className={styles.checkIcon} title={`Granted for ${r.label}`}>
                              <Check size={18} strokeWidth={2.5} />
                            </span>
                          ) : (
                            <span className={styles.crossIcon} title={`Denied for ${r.label}`}>
                              <Minus size={16} />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default RbacControl;
