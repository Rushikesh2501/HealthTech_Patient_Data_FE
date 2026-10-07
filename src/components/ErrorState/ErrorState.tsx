import React from 'react';
import styles from './ErrorState.module.css';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { SecondaryButton } from '../SecondaryButton/SecondaryButton';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Failed to load information. Please verify your connection or try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`.trim()} role="alert">
      <div className={styles.iconWrapper} aria-hidden="true">
        <AlertCircle size={28} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <div className={styles.retryBtn}>
          <SecondaryButton onClick={onRetry} icon={<RefreshCw size={14} />}>
            Retry Request
          </SecondaryButton>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
