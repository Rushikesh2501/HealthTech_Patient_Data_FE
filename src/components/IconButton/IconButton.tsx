import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  'aria-label': string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  variant = 'outline',
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  const classNames = [
    styles.iconButton,
    variant === 'ghost' ? styles.ghost : '',
    size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} aria-label={ariaLabel} title={ariaLabel} {...props}>
      {children}
    </button>
  );
};

export default IconButton;
