import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from './AuditLogs.module.css';
import { RotateCcw } from 'lucide-react';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { FilterSelect } from '../../components/FilterSelect/FilterSelect';
import { DataTable, Column } from '../../components/DataTable/DataTable';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { auditLogsApi } from './api';
import { AuditLog } from '../../types/audit';
import { formatDateTime } from '../../utils/formatters';

const DEFAULT_ROLE_OPTIONS = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Clinician', value: 'CLINICIAN' },
  { label: 'Nurse', value: 'NURSE' },
  { label: 'Superadmin', value: 'SUPERADMIN' },
  { label: 'Anonymous', value: 'ANONYMOUS' },
];

export const AuditLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const {
    data: logs = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => auditLogsApi.getAuditLogs(),
  });

  const roleOptions = useMemo(() => {
    const options = [...DEFAULT_ROLE_OPTIONS];
    const existing = new Set(options.map((o) => o.value.toUpperCase()));
    logs.forEach((log) => {
      if (log.role && !existing.has(log.role.toUpperCase())) {
        existing.add(log.role.toUpperCase());
        options.push({
          label: log.role.charAt(0).toUpperCase() + log.role.slice(1).toLowerCase(),
          value: log.role.toUpperCase(),
        });
      }
    });
    return options;
  }, [logs]);

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = Boolean(searchTerm || roleFilter || statusFilter);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        !searchTerm ||
        log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = !roleFilter || log.role?.toLowerCase() === roleFilter.toLowerCase();
      const matchesStatus = !statusFilter || log.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [logs, searchTerm, roleFilter, statusFilter]);

  const columns: Column<AuditLog>[] = [
    {
      id: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      accessor: 'timestamp',
      cell: (row) => <span>{formatDateTime(row.timestamp)}</span>,
    },
    {
      id: 'user',
      header: 'User',
      sortable: true,
      accessor: 'user',
      cell: (row) => (
        <div>
          <p style={{ fontWeight: 600, fontSize: '13px' }}>{row.user}</p>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            IP: {row.ipAddress || 'Internal'}
          </span>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      sortable: true,
      accessor: 'role',
      cell: (row) => <span style={{ fontWeight: 600, fontSize: '12px' }}>{row.role}</span>,
    },
    {
      id: 'action',
      header: 'Action',
      sortable: true,
      accessor: 'action',
      cell: (row) => {
        const badgeClass = (styles as any)[`action${row.action}`] || styles.actionLOGIN;
        return <span className={`${styles.actionBadge} ${badgeClass}`}>{row.action}</span>;
      },
    },
    {
      id: 'entity',
      header: 'Entity',
      sortable: true,
      accessor: 'entity',
      cell: (row) => <span className={styles.entityBadge}>{row.entity}</span>,
    },
    {
      id: 'entityId',
      header: 'Entity ID',
      accessor: 'entityId',
      cell: (row) => <span className={styles.entityId}>{row.entityId}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: 'details',
      header: 'Event Context',
      cell: (row) => (
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {row.details || '—'}
        </span>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Security & Audit Logs"
        subtitle="Immutable security trail monitoring administrative access, CRUD transactions, and RBAC enforcement."
      />

      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by user, entity, or event details..."
          />
        </div>

        <div className={styles.filtersGroup}>
          <FilterSelect
            value={roleFilter}
            options={roleOptions}
            onChange={setRoleFilter}
            placeholder="All Roles"
          />

          <FilterSelect
            value={statusFilter}
            options={[
              { label: 'Completed', value: 'completed' },
              { label: 'Failed', value: 'failed' },
            ]}
            onChange={setStatusFilter}
            placeholder="All Statuses"
          />

          <button
            type="button"
            className={styles.clearFiltersBtn}
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            aria-label="Clear filters"
            title={hasActiveFilters ? 'Clear all active filters' : 'No active filters to clear'}
          >
            <RotateCcw size={14} />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredLogs}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle="No audit records found"
        emptyDescription="No events match your current filter criteria."
      />
    </PageContainer>
  );
};

export default AuditLogs;
