import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout/DashboardLayout';

import { Login } from '../pages/Login/Login';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Patients } from '../pages/Patients/Patients';
import { PatientDetails } from '../pages/PatientDetails/PatientDetails';
import { Encounters } from '../pages/Encounters/Encounters';
import { Analytics } from '../pages/Analytics/Analytics';
import { AuditLogs } from '../pages/AuditLogs/AuditLogs';
import { Settings } from '../pages/Settings/Settings';
import { RbacControl } from '../pages/RbacControl/RbacControl';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path={ROUTES.LOGIN} element={<Login />} />

      {/* Protected routes wrapped in DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route
          path={ROUTES.PATIENTS}
          element={
            <ProtectedRoute requiredPermission="patients.read">
              <Patients />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PATIENT_DETAILS}
          element={
            <ProtectedRoute requiredPermission="patients.read">
              <PatientDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ENCOUNTERS}
          element={
            <ProtectedRoute requiredPermission="encounters.read">
              <Encounters />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ANALYTICS}
          element={
            <ProtectedRoute requiredPermission="analytics.read">
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* Admin only routes */}
        <Route
          path={ROUTES.AUDIT_LOGS}
          element={
            <ProtectedRoute requiredRole="admin" requiredPermission="audit.read">
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SETTINGS}
          element={
            <ProtectedRoute requiredRole="admin" requiredPermission="settings.manage">
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* SuperAdmin exclusive RBAC Control */}
        <Route
          path={ROUTES.RBAC}
          element={
            <ProtectedRoute requiredRole="superadmin" requiredPermission="rbac.manage">
              <RbacControl />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback redirect */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};

export default AppRoutes;
