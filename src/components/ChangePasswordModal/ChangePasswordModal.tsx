import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ChangePasswordModal.module.css';
import { KeyRound, Eye, EyeOff, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { FormField } from '../FormField/FormField';
import { PrimaryButton } from '../PrimaryButton/PrimaryButton';
import { SecondaryButton } from '../SecondaryButton/SecondaryButton';
import { DangerButton } from '../DangerButton/DangerButton';
import { loginApi } from '../../pages/Login/api';
import { STORAGE_KEYS, ROUTES } from '../../utils/constants';

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [showConfirmWarning, setShowConfirmWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleResetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFormError(null);
    setShowConfirmWarning(false);
  };

  const handleClose = () => {
    handleResetForm();
    onClose();
  };

  const handleValidateForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!oldPassword.trim()) {
      setFormError('Please enter your current password.');
      return;
    }

    if (!newPassword.trim()) {
      setFormError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setFormError('New password must be at least 8 characters in length.');
      return;
    }

    if (newPassword === oldPassword) {
      setFormError('New password cannot be the same as your current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('New password and confirmation password do not match.');
      return;
    }

    // Validation passed -> Open confirmation dialog with logout warning
    setShowConfirmWarning(true);
  };

  const handleExecutePasswordReset = async () => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      await loginApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });

      // Clear authentication tokens and local user data immediately
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);

      // Close modal
      handleResetForm();
      onClose();

      // Redirect to login with confirmation success notification
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: {
          successMessage: 'Password updated successfully! You have been logged out. Please sign in with your new credentials.',
        },
      });
    } catch (err: any) {
      setShowConfirmWarning(false);
      setFormError(err?.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Primary Password Input Modal */}
      <div className={styles.backdrop} onClick={handleClose} role="dialog" aria-modal="true">
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.iconWrapper}>
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className={styles.title}>Reset Account Password</h3>
                <p className={styles.subtitle}>Enter your current password and choose a new secure password.</p>
              </div>
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {formError && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleValidateForm} className={styles.form} noValidate>
            <div>
              <div className={styles.passwordInputWrapper}>
                <FormField
                  label="Current Password"
                  type={showOldPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  aria-label={showOldPassword ? 'Hide password' : 'Show password'}
                  style={{ top: '29px' }}
                >
                  {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <div className={styles.passwordInputWrapper}>
                <FormField
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  style={{ top: '29px' }}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <div className={styles.passwordInputWrapper}>
                <FormField
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  style={{ top: '29px' }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className={styles.guidelines}>
              <strong>Password Security Requirements:</strong>
              <ul className={styles.guidelinesList}>
                <li>Must contain at least 8 characters</li>
                <li>Cannot match your existing current password</li>
                <li>Changing your password will automatically log you out across all active sessions</li>
              </ul>
            </div>

            <div className={styles.actions}>
              <SecondaryButton type="button" onClick={handleClose}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                disabled={!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim() || isSubmitting}
              >
                Continue to Reset
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Popup Modal with Auto-Logout Warning */}
      {showConfirmWarning && (
        <div
          className={styles.warningBackdrop}
          onClick={() => !isSubmitting && setShowConfirmWarning(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.warningModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.warningHeader}>
              <div className={styles.warningIconWrapper}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className={styles.warningTitle}>Confirm Password Reset</h3>
                <p className={styles.warningSubtitle}>Please review the security notice below.</p>
              </div>
            </div>

            <div className={styles.warningBanner}>
              <span className={styles.warningHighlight}>
                ⚠️ Automatic Sign-Out Notice
              </span>
              Changing your password will automatically terminate your current session and log you out. You will need to sign in again using your new password.
            </div>

            <div className={styles.confirmActions}>
              <SecondaryButton
                type="button"
                onClick={() => setShowConfirmWarning(false)}
                disabled={isSubmitting}
              >
                Cancel
              </SecondaryButton>
              <DangerButton
                type="button"
                onClick={handleExecutePasswordReset}
                isLoading={isSubmitting}
              >
                Confirm & Reset Password
              </DangerButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChangePasswordModal;
