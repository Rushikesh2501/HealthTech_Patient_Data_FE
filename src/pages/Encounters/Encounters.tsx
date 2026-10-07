import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Encounters.module.css';
import { PlusCircle, RotateCcw } from 'lucide-react';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton/SecondaryButton';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { FilterSelect } from '../../components/FilterSelect/FilterSelect';
import { DataTable, Column } from '../../components/DataTable/DataTable';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { RowActions } from '../../components/RowActions/RowActions';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { EncounterModal } from './EncounterModal';
import { Encounter } from '../../types/encounter';
import { useEncounters, useDeleteEncounter } from '../../hooks/useEncounters';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';
import { COMMON_DIAGNOSES, STATUS_OPTIONS } from '../../utils/constants';

export const Encounters: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();

  const { data: encounters = [], isLoading, isError, refetch } = useEncounters();
  const deleteMutation = useDeleteEncounter();

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [diagnosisFilter, setDiagnosisFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Modal & ConfirmDialog state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEncounter, setEditingEncounter] = useState<Encounter | null>(null);
  const [deletingEncounter, setDeletingEncounter] = useState<Encounter | null>(null);

  const canCreate = hasPermission('encounters.create');
  const canUpdate = hasPermission('encounters.update');
  const canDelete = hasPermission('encounters.delete');

  useEffect(() => {
    if ((location.state as any)?.openNew && canCreate) {
      handleOpenModal();
    }
  }, [location.state, canCreate]);

  const handleOpenModal = (encounter?: Encounter) => {
    setEditingEncounter(encounter || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEncounter(null);
  };

  const handleDeleteConfirm = async () => {
    if (deletingEncounter) {
      await deleteMutation.mutateAsync(deletingEncounter.id);
      setDeletingEncounter(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDiagnosisFilter('');
    setStatusFilter('');
    setDateFilter('');
  };

  const filteredEncounters = useMemo(() => {
    return encounters.filter((enc) => {
      const matchesSearch =
        !searchTerm ||
        enc.encounterId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enc.patientDisplayId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enc.symptoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enc.clinician?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDiagnosis = !diagnosisFilter || enc.diagnosis === diagnosisFilter;
      const matchesStatus = !statusFilter || enc.status === statusFilter;
      const matchesDate = !dateFilter || enc.date.startsWith(dateFilter);

      return matchesSearch && matchesDiagnosis && matchesStatus && matchesDate;
    });
  }, [encounters, searchTerm, diagnosisFilter, statusFilter, dateFilter]);

  const columns: Column<Encounter>[] = [
    {
      id: 'encounterId',
      header: 'Encounter ID',
      sortable: true,
      accessor: 'encounterId',
      cell: (row) => <span className={styles.encounterBadge}>{row.encounterId}</span>,
    },
    {
      id: 'patient',
      header: 'Patient',
      sortable: true,
      accessor: 'patientDisplayId',
      cell: (row) => (
        <span
          className={styles.patientLink}
          onClick={() => navigate(`/patients/${row.patientId}`)}
          title="View Patient File"
        >
          {row.patientDisplayId}
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      sortable: true,
      accessor: 'date',
      cell: (row) => <span>{formatDate(row.date)}</span>,
    },
    {
      id: 'symptoms',
      header: 'Symptoms',
      accessor: 'symptoms',
      cell: (row) => <span className={styles.truncateText} title={row.symptoms}>{row.symptoms}</span>,
    },
    {
      id: 'diagnosis',
      header: 'Diagnosis',
      sortable: true,
      accessor: 'diagnosis',
      cell: (row) => <span style={{ fontWeight: 600 }}>{row.diagnosis}</span>,
    },
    {
      id: 'vitals',
      header: 'Vitals',
      cell: (row) => (
        <span style={{ fontSize: '13px' }}>
          {row.temperature}°F • {row.bloodPressure}
        </span>
      ),
    },
    {
      id: 'clinician',
      header: 'Clinician',
      sortable: true,
      accessor: 'clinician',
      cell: (row) => <span>{row.clinician}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <RowActions
          onView={() => navigate(`/patients/${row.patientId}`)}
          onEdit={canUpdate ? () => handleOpenModal(row) : undefined}
          onDelete={canDelete ? () => setDeletingEncounter(row) : undefined}
          canEdit={canUpdate}
          canDelete={canDelete}
        />
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Patient Encounters"
        subtitle="Real-time clinical encounters recorded during teleconsultations and in-clinic visits."
        action={
          canCreate ? (
            <PrimaryButton
              icon={<PlusCircle size={16} />}
              onClick={() => handleOpenModal()}
            >
              Add Encounter
            </PrimaryButton>
          ) : undefined
        }
      />

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by ID, symptoms, clinician..."
        />

        <div className={styles.filtersGroup}>
          <FilterSelect
            value={diagnosisFilter}
            options={COMMON_DIAGNOSES.map((d) => ({ label: d, value: d }))}
            onChange={setDiagnosisFilter}
            placeholder="All Diagnoses"
          />

          <FilterSelect
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={setStatusFilter}
            placeholder="All Statuses"
          />

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              fontSize: 'var(--font-size-sm)',
            }}
            aria-label="Filter by encounter date"
          />

          {(searchTerm || diagnosisFilter || statusFilter || dateFilter) && (
            <SecondaryButton
              icon={<RotateCcw size={14} />}
              onClick={clearFilters}
              size="sm"
            >
              Clear Filters
            </SecondaryButton>
          )}
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredEncounters}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle="No patient encounters found"
        emptyDescription="No clinical records match your current filters. Adjust your criteria or record a new encounter."
        emptyAction={
          canCreate ? (
            <PrimaryButton
              icon={<PlusCircle size={16} />}
              onClick={() => handleOpenModal()}
              size="sm"
            >
              Add Encounter
            </PrimaryButton>
          ) : undefined
        }
      />

      {/* Encounter Add/Edit Modal */}
      {isModalOpen && (
        <EncounterModal
          isOpen={isModalOpen}
          editingEncounter={editingEncounter}
          onClose={handleCloseModal}
        />
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingEncounter)}
        title="Confirm Encounter Deletion"
        message={`Are you sure you want to permanently delete encounter record ${deletingEncounter?.encounterId}? This action cannot be reversed.`}
        confirmLabel="Delete Encounter"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingEncounter(null)}
      />
    </PageContainer>
  );
};

export default Encounters;
