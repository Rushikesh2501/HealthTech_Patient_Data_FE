import React from 'react';
import styles from './Avatar.module.css';
import { formatInitials } from '../../utils/formatters';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className = '',
}) => {
  const initials = formatInitials(name);
  const sizeClass = styles[size] || styles.md;

  return (
    <div
      className={`${styles.avatar} ${sizeClass} ${className}`.trim()}
      title={name}
      aria-label={name}
    >
      {src ? <img src={src} alt={name} /> : <span>{initials}</span>}
    </div>
  );
};

export default Avatar;
