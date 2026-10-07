import React from 'react';
import styles from './AppHeader.module.css';
import { Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../Avatar/Avatar';

export interface AppHeaderProps {
  title?: string;
  onOpenMobileMenu?: () => void;
  className?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  onOpenMobileMenu,
  className = '',
}) => {
  const { user } = useAuth();

  return (
    <header className={`${styles.header} ${className}`.trim()}>
      <div className={styles.left}>
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className={styles.menuButton}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}
        <h2 className={styles.pageTitle}>{title || 'Overview'}</h2>
      </div>

      <div className={styles.right}>
        {/* User profile avatar & name */}
        <div className={styles.userProfile}>
          <Avatar name={user?.name || 'User'} size="sm" />
          <span className={styles.userName}>{user?.name || 'Dr. Practitioner'}</span>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
