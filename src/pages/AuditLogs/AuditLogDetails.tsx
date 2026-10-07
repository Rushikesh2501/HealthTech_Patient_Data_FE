import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import styles from './AuditLogDetails.module.css';
import listStyles from './AuditLogs.module.css';
import { ArrowLeft, Clock, Shield, Database, FileText } from 'lucide-react';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { LoadingState } from '../../components/LoadingState/LoadingState';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { auditLogsApi } from './api';
import { AuditLog } from '../../types/audit';
import { formatDateTime } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

export const AuditLogDetails: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Try to use log passed via state for instant load
  const initialLog: AuditLog | undefined = location.state?.log;

  const {
    data: log,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['audit-log', id],
    queryFn: () => auditLogsApi.getAuditLogById(id),
    initialData: initialLog,
    enabled: Boolean(id),
  });

  if (isLoading && !log) {
    return (
      <PageContainer>
        <LoadingState message="Retrieving audit event details..." />
      </PageContainer>
    );
  }

  if (isError || !log) {
    return (
      <PageContainer>
        <button onClick={() => navigate(ROUTES.AUDIT_LOGS)} className={styles.backButton}>
          <ArrowLeft size={16} />
          <span>Back to Security & Audit Logs</span>
        </button>
        <ErrorState
          title="Audit Record Not Found"
          message="Could not find an audit event with the specified ID."
          onRetry={() => refetch()}
        />
      </PageContainer>
    );
  }

  const badgeClass =
    (listStyles as any)[`action${log.action}`] || listStyles.actionLOGIN;

  return (
    <PageContainer>
      <button onClick={() => navigate(ROUTES.AUDIT_LOGS)} className={styles.backButton}>
        <ArrowLeft size={16} />
        <span>Back to Security & Audit Logs</span>
      </button>

      <PageHeader
        title={`Audit Event: ${log.action}`}
        subtitle="Immutable security trail monitoring administrative access, CRUD transactions, and RBAC enforcement."
      />

      {/* Prominent Timestamp Hero Card */}
      <div className={styles.timestampHeroCard}>
        <div className={styles.timestampLeft}>
          <div className={styles.timestampIconBox}>
            <Clock size={24} />
          </div>
          <div className={styles.timestampInfo}>
            <span className={styles.timestampLabel}>Event Timestamp</span>
            <span className={styles.timestampPrimary}>{formatDateTime(log.timestamp)}</span>
            <span className={styles.timestampIso}>ISO: {log.timestamp}</span>
          </div>
        </div>

        <div className={styles.timestampRight}>
          <span className={`${listStyles.actionBadge} ${badgeClass}`}>
            {log.action}
          </span>
          <StatusBadge status={log.status} />
        </div>
      </div>

      {/* Details Grid */}
      <div className={styles.detailsGrid}>
        {/* User & Security Context */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <Shield size={18} />
            </div>
            <h3 className={styles.cardTitle}>User & Security Context</h3>
          </div>

          <div className={styles.keyValueList}>
            <div className={styles.keyValueRow}>
              <span className={styles.keyLabel}>User Account</span>
              <span className={styles.valData}>{log.user || 'Unknown'}</span>
            </div>

            <div className={styles.keyValueRow}>
              <span className={styles.keyLabel}>Role</span>
              <span className={styles.roleBadge}>{log.role || 'Unassigned'}</span>
            </div>

            <div className={styles.keyValueRow}>
              <span className={styles.keyLabel}>Source IP Address</span>
              <span className={styles.valData}>{log.ipAddress || 'Internal / Local'}</span>
            </div>

            <div className={styles.keyValueRow}>
              <span className={styles.keyLabel}>Audit Record ID</span>
              <span className={styles.valData}>#{log.id}</span>
            </div>
          </div>
        </div>

        {/* Entity & Transaction Details */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <Database size={18} />
            </div>
            <h3 className={styles.cardTitle}>Target Entity Details</h3>
          </div>

          <div className={styles.keyValueList}>
            <div className={styles.keyValueRow}>
              <span className={styles.keyLabel}>Target Entity</span>
              <span className={styles.entityBadge}>{log.entity || 'SYSTEM'}</span>
            </div>

            <div className={styles.keyValueRow}>
              <span className={styles.keyLabel}>Target Entity ID</span>
              <span className={styles.entityIdCode}>{log.entityId || 'N/A'}</span>
            </div>

            <div className={styles.keyValueRow}>
              <span className={styles.keyLabel}>Action Type</span>
              <span className={styles.valData}>{log.action}</span>
            </div>

            <div className={styles.keyValueRow}>
              <span className={styles.keyLabel}>Execution Status</span>
              <StatusBadge status={log.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Event Context Description Card */}
      <div className={styles.contextCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderIcon}>
            <FileText size={18} />
          </div>
          <h3 className={styles.cardTitle}>Event Context & Audit Trail Details</h3>
        </div>

        <div className={styles.contextBox}>
          {log.details || 'No additional payload or context details recorded for this event.'}
        </div>
      </div>
    </PageContainer>
  );
};

export default AuditLogDetails;
