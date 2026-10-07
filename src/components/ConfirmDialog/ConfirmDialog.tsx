import React, { useEffect } from 'react';
import styles from './ConfirmDialog.module.css';
import { AlertTriangle } from 'lucide-react';
import { SecondaryButton } from '../SecondaryButton/SecondaryButton';
import { DangerButton } from '../DangerButton/DangerButton';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.iconWrapper} aria-hidden="true">
            <AlertTriangle size={20} />
          </div>
          <h3 id="confirm-dialog-title" className={styles.title}>
            {title}
          </h3>
        </div>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <SecondaryButton onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </SecondaryButton>
          <DangerButton onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </DangerButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
