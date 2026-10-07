import React from 'react';
import styles from './LoadingState.module.css';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data, please wait...',
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`.trim()} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default LoadingState;
