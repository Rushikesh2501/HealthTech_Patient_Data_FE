import React, { useState } from 'react';
import styles from './RbacControl.module.css';
import { ShieldCheck, Check, Minus, Pencil, Save, X } from 'lucide-react';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton/SecondaryButton';
import { useAuth } from '../../hooks/useAuth';
import {
  Permission,
  getRolePermissions,
  saveRolePermissions,
} from '../../utils/permissions';
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
];

const ROLES: { id: UserRole; label: string; badgeClass: string }[] = [
  { id: 'admin', label: 'ADMIN', badgeClass: styles.roleBadgeAdmin },
  { id: 'clinician', label: 'CLINICIAN', badgeClass: styles.roleBadgeClinician },
  { id: 'nurse', label: 'NURSE', badgeClass: styles.roleBadgeNurse },
];

export const RbacControl: React.FC = () => {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<Record<UserRole, Permission[]>>(() =>
    getRolePermissions()
  );
  const [draftPermissions, setDraftPermissions] = useState<Record<UserRole, Permission[]>>(() =>
    getRolePermissions()
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleStartEdit = () => {
    setDraftPermissions(permissions);
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const handleCancel = () => {
    setDraftPermissions(permissions);
    setIsEditing(false);
  };

  const handleTogglePermission = (role: UserRole, perm: Permission) => {
    setDraftPermissions((prev) => {
      const currentList = prev[role] || [];
      const updated = currentList.includes(perm)
        ? currentList.filter((p) => p !== perm)
        : [...currentList, perm];
      return {
        ...prev,
        [role]: updated,
      };
    });
  };

  const handleSave = () => {
    saveRolePermissions(draftPermissions);
    setPermissions(draftPermissions);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  return (
    <PageContainer>
      <div className={styles.container}>
        {/* SuperAdmin Authority Banner */}
        <div className={styles.clearanceBanner}>
          <div className={styles.clearanceLeft}>
            <div className={styles.shieldIcon}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h2 className={styles.clearanceTitle}>RBAC Control & Security Governance</h2>
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
            <span className={styles.statValue}>{ROLES.length}</span>
            <span className={styles.statHint}>Admin, Clinician, Nurse</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Governed Capabilities</span>
            <span className={styles.statValue}>{MATRIX_ROWS.length}</span>
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
                {isEditing
                  ? 'Editing permissions: check or uncheck options to grant or revoke capabilities per role.'
                  : 'Evaluation of active permission grants across all clinical user roles.'}
              </p>
            </div>

            <div className={styles.headerActions}>
              {!isEditing ? (
                <PrimaryButton
                  icon={<Pencil size={16} />}
                  onClick={handleStartEdit}
                  className={styles.actionBtn}
                  aria-label="Edit role permissions"
                >
                  Edit Permissions
                </PrimaryButton>
              ) : (
                <div className={styles.editBtnGroup}>
                  <SecondaryButton
                    icon={<X size={16} />}
                    onClick={handleCancel}
                    className={styles.actionBtn}
                    aria-label="Cancel editing"
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    icon={<Save size={16} />}
                    onClick={handleSave}
                    className={styles.actionBtn}
                    aria-label="Save changes"
                  >
                    Save Changes
                  </PrimaryButton>
                </div>
              )}
            </div>
          </div>

          {saveSuccess && (
            <div className={styles.successBanner} role="status">
              <Check size={16} strokeWidth={2.5} />
              <span>Role permissions updated and actively enforced across the application.</span>
            </div>
          )}

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
                      const hasPerm = isEditing
                        ? draftPermissions[r.id]?.includes(row.key)
                        : permissions[r.id]?.includes(row.key);

                      return (
                        <td key={r.id} className={styles.centerCol}>
                          {isEditing ? (
                            <label className={styles.checkboxWrapper}>
                              <input
                                type="checkbox"
                                className={styles.checkbox}
                                checked={Boolean(hasPerm)}
                                onChange={() => handleTogglePermission(r.id, row.key)}
                                aria-label={`Grant ${row.label} to ${r.label}`}
                              />
                            </label>
                          ) : hasPerm ? (
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
