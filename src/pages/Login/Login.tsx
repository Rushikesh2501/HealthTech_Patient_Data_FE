import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './Login.module.css';
import { Activity, AlertCircle, CheckCircle2, Info, Lock, Eye, EyeOff } from 'lucide-react';
import { loginSchema, LoginSchemaType } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton';
import { FormField } from '../../components/FormField/FormField';
import { ROUTES } from '../../utils/constants';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, sessionExpiredMessage, clearSessionExpiredMessage } = useAuth();

  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const successMessage = (location.state as any)?.message || (location.state as any)?.successMessage;
  const from = (location.state as any)?.from?.pathname || ROUTES.DASHBOARD;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    return () => {
      clearSessionExpiredMessage();
    };
  }, [clearSessionExpiredMessage]);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const onSubmit = async (data: LoginSchemaType) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.brandHeader}>
          <div className={styles.logoIcon}>
            <Activity size={30} />
          </div>
          <div>
            <h1 className={styles.brandTitle}>HealthTech Portal</h1>
            <p className={styles.brandSubtitle}>
              Secure Clinical Patient Data & Telemedicine Dashboard
            </p>
          </div>
        </div>

        {sessionExpiredMessage && (
          <div className={`${styles.alertBox} ${styles.alertInfo}`} role="alert">
            <Info size={16} />
            <span>{sessionExpiredMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className={`${styles.alertBox} ${styles.alertSuccess}`} role="alert">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {authError && (
          <div className={`${styles.alertBox} ${styles.alertError}`} role="alert">
            <AlertCircle size={16} />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <FormField
            label="Official Healthcare Email"
            type="email"
            placeholder="doctor@healthtech.gov.in"
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <FormField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your security password..."
            error={errors.password?.message}
            required
            rightElement={
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            {...register('password')}
          />

          <div className={styles.rememberRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                {...register('rememberMe')}
              />
              <span>Remember this workstation</span>
            </label>
          </div>

          <PrimaryButton
            type="submit"
            isLoading={isSubmitting}
            fullWidth
            icon={<Lock size={16} />}
          >
            Authenticate & Enter
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default Login;
