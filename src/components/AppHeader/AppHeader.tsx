import React, { useState } from 'react';
import styles from './AppHeader.module.css';
import { Menu, KeyRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../Avatar/Avatar';
import { ChangePasswordModal } from '../ChangePasswordModal';

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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <>
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
          {/* Quick password reset shortcut */}
          <button
            type="button"
            className={styles.keyButton}
            onClick={() => setIsPasswordModalOpen(true)}
            title="Change Password"
            aria-label="Change Password"
          >
            <KeyRound size={16} />
          </button>

          {/* User profile avatar, name, divider, and role */}
          <div className={styles.userProfile}>
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || 'Dr. Practitioner'}</span>
              <div className={styles.userDivider} />
              <span className={`${styles.userRole} ${user?.role ? styles[`role_${user.role.toLowerCase()}`] || '' : ''}`}>
                {user?.role ? user.role.toUpperCase() : 'USER'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default AppHeader;
