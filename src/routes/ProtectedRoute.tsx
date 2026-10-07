import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/user';
import { Permission } from '../utils/permissions';
import { ROUTES } from '../utils/constants';
import { LoadingState } from '../components/LoadingState/LoadingState';
import { ErrorState } from '../components/ErrorState/ErrorState';

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: Permission;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
}) => {
  const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState message="Verifying session and credentials..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
        <ErrorState
          title="Access Restricted (403 Forbidden)"
          message="You do not have the required role credentials to view this clinical module. Please contact your system administrator."
        />
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
        <ErrorState
          title="Access Restricted (403 Forbidden)"
          message="Your account does not possess the permissions necessary for this feature."
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
