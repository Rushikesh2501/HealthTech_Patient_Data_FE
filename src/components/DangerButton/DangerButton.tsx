import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './DangerButton.module.css';

export interface DangerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const DangerButton: React.FC<DangerButtonProps> = ({
  children,
  icon,
  isLoading = false,
  fullWidth = false,
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const classNames = [
    styles.button,
    fullWidth ? styles.fullWidth : '',
    size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        icon && <span className={styles.icon}>{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};

export default DangerButton;
