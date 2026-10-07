import React from 'react';
import styles from './StatusBadge.module.css';

export type BadgeStatus =
  | 'scheduled'
  | 'completed'
  | 'active'
  | 'inactive'
  | 'cancelled'
  | 'pending'
  | 'failed'
  | string;

export interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showDot = true,
  className = '',
}) => {
  const normalized = (status || '').toLowerCase();
  const statusClass = styles[normalized] || styles.inactive;

  return (
    <span className={`${styles.badge} ${statusClass} ${className}`.trim()}>
      {showDot && <span className={styles.dot} aria-hidden="true" />}
      <span>{label || status}</span>
    </span>
  );
};

export default StatusBadge;
