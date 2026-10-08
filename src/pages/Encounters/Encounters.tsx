import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Encounters.module.css';
import { PlusCircle, RotateCcw } from 'lucide-react';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { FilterSelect } from '../../components/FilterSelect/FilterSelect';
import { DataTable, Column } from '../../components/DataTable/DataTable';
import { RowActions } from '../../components/RowActions/RowActions';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { EncounterModal } from './EncounterModal';
import { Encounter } from '../../types/encounter';
import { useEncounters, useDeleteEncounter } from '../../hooks/useEncounters';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';

export const Encounters: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();

  const { data: encounters = [], isLoading, isError, refetch } = useEncounters();
  const deleteMutation = useDeleteEncounter();

  // Search and Sort state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('');

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
    setSortOrder('');
  };

  const hasActiveFilters = Boolean(searchTerm || sortOrder);

  const getEncounterId = (enc: Encounter): string => {
    return (enc.encounterId || (enc as any).encounter_id || (enc as any).id || '').toString().trim();
  };

  const filteredEncounters = useMemo(() => {
    let result = encounters.filter((enc) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        getEncounterId(enc).toLowerCase().includes(term) ||
        enc.patientDisplayId?.toLowerCase().includes(term) ||
        enc.patientId?.toLowerCase().includes(term) ||
        enc.symptoms?.toLowerCase().includes(term) ||
        enc.clinician?.toLowerCase().includes(term) ||
        enc.diagnosis?.toLowerCase().includes(term)
      );
    });

    if (sortOrder) {
      result = [...result].sort((a, b) => {
        const idA = getEncounterId(a);
        const idB = getEncounterId(b);
        const comp = idA.localeCompare(idB, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
        return sortOrder === 'asc' ? comp : -comp;
      });
    }

    return result;
  }, [encounters, searchTerm, sortOrder]);

  const columns: Column<Encounter>[] = [
    {
      id: 'encounterId',
      header: 'Encounter ID',
      sortable: true,
      accessor: (row) => getEncounterId(row),
      cell: (row) => (
        <span
          className={styles.encounterBadge}
          onClick={() => navigate(`/patients/${row.patientId}`)}
          style={{ cursor: 'pointer' }}
          title="View Patient & Encounter Details"
        >
          {getEncounterId(row)}
        </span>
      ),
    },
    {
      id: 'patient',
      header: 'Patient ID',
      sortable: true,
      accessor: 'patientDisplayId',
      cell: (row) => (
        <span
          className={styles.patientLink}
          onClick={() => navigate(`/patients/${row.patientId}`)}
          title="View Patient & Encounter Details"
        >
          {row.patientDisplayId || row.patientId}
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      sortable: true,
      accessor: 'date',
      align: 'center',
      hideOnMobile: true,
      cell: (row) => <span>{formatDate(row.date)}</span>,
    },
    {
      id: 'clinician',
      header: 'Staff Name',
      sortable: true,
      accessor: 'clinician',
      hideOnMobile: true,
      cell: (row) => <span>{row.clinician || 'Attending Staff'}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'center',
      width: 110,
      cell: (row) => (
        <RowActions
          onView={() => navigate(`/patients/${row.patientId}`)}
          onEdit={canUpdate ? () => handleOpenModal(row) : undefined}
          onDelete={canDelete ? () => setDeletingEncounter(row) : undefined}
          canEdit={canUpdate}
          canDelete={canDelete}
          viewTitle="View encounter details"
        />
      ),
    },
  ];

  const SORT_OPTIONS = [
    { label: 'A - Z', value: 'asc' },
    { label: 'Z - A', value: 'desc' },
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
        <div className={styles.searchContainer}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by encounter ID, patient ID, staff..."
          />
        </div>

        <div className={styles.filtersGroup}>
          <FilterSelect
            value={sortOrder}
            options={SORT_OPTIONS}
            onChange={setSortOrder}
            placeholder="A - Z / Z - A"
            aria-label="Sort encounters A-Z or Z-A"
          />

          <button
            type="button"
            className={styles.clearFiltersBtn}
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            aria-label="Clear filters"
            title={hasActiveFilters ? 'Clear search and sorting' : 'No active filters to clear'}
          >
            <RotateCcw size={14} />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        key={`${sortOrder || 'default'}-${searchTerm}`}
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
