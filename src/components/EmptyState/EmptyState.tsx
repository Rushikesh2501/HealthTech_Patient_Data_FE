import React, { ReactNode } from 'react';
import styles from './EmptyState.module.css';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are no items matching your criteria. Try adjusting your search or filters.',
  icon,
  action,
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`.trim()}>
      <div className={styles.iconWrapper} aria-hidden="true">
        {icon || <Inbox size={26} />}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};

export default EmptyState;
