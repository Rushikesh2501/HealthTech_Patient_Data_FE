import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './Patients.module.css';
import { UserPlus, RotateCcw, X } from 'lucide-react';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton/SecondaryButton';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { FilterSelect } from '../../components/FilterSelect/FilterSelect';
import { DataTable, Column } from '../../components/DataTable/DataTable';
import { Avatar } from '../../components/Avatar/Avatar';
import { RowActions } from '../../components/RowActions/RowActions';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { FormField } from '../../components/FormField/FormField';
import { Patient } from '../../types/patient';
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '../../hooks/usePatients';
import { useAuth } from '../../hooks/useAuth';
import { patientSchema, PatientSchemaType } from '../../utils/validators';
import { formatDate } from '../../utils/formatters';
import { GENDER_OPTIONS } from '../../utils/constants';

export const Patients: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();

  const { data: patients = [], isLoading, isError, refetch } = usePatients();
  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('');

  // Modal & ConfirmDialog state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  const canCreate = hasPermission('patients.create');
  const canUpdate = hasPermission('patients.update');
  const canDelete = hasPermission('patients.delete');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PatientSchemaType>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      age: '' as any,
      gender: '' as any,
      district: '',
      status: 'active',
    },
  });

  const watchedName = watch('name');
  const watchedAge = watch('age');
  const watchedGender = watch('gender');
  const watchedDistrict = watch('district');

  const isFormIncomplete =
    !watchedName?.trim() ||
    watchedAge === undefined ||
    watchedAge === null ||
    (typeof watchedAge === 'string' && (watchedAge as string).trim() === '') ||
    isNaN(Number(watchedAge)) ||
    !watchedGender ||
    !watchedDistrict?.trim();

  // Check if navigation requested opening register modal
  useEffect(() => {
    if ((location.state as any)?.openRegister && canCreate) {
      handleOpenModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, canCreate]);

  // Lock body scroll when patient modal is open
  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen]);

  const handleOpenModal = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      reset({
        name: patient.name || '',
        age: patient.age,
        gender: patient.gender,
        district: patient.district || '',
        status: patient.status,
      });
    } else {
      setEditingPatient(null);
      reset({
        name: '',
        age: '' as any,
        gender: '' as any,
        district: '',
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleClearAll = () => {
    reset({
      name: '',
      age: '' as any,
      gender: '' as any,
      district: '',
      status: 'active',
    });
  };

  const onFormSubmit = async (data: PatientSchemaType) => {
    const patientStatus = data.status || editingPatient?.status || 'active';
    if (editingPatient) {
      await updatePatientMutation.mutateAsync({
        id: editingPatient.id,
        data: {
          name: data.name,
          age: data.age,
          gender: data.gender,
          district: data.district,
          status: patientStatus,
        },
      });
    } else {
      await createPatientMutation.mutateAsync({
        name: data.name,
        age: data.age,
        gender: data.gender,
        district: data.district,
        status: patientStatus,
      });
    }
    handleCloseModal();
  };

  const handleDeleteConfirm = async () => {
    if (deletingPatient) {
      await deletePatientMutation.mutateAsync(deletingPatient.id);
      setDeletingPatient(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setGenderFilter('');
  };

  const hasActiveFilters = Boolean(searchTerm || genderFilter);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch =
        !searchTerm ||
        (patient.name && patient.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.district && patient.district.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGender = !genderFilter || patient.gender === genderFilter;

      return matchesSearch && matchesGender;
    });
  }, [patients, searchTerm, genderFilter]);

  const columns: Column<Patient>[] = [
    {
      id: 'patient',
      header: 'Patient Name',
      sortable: true,
      accessor: (p) => p.name || p.patientId,
      cell: (row) => (
        <div className={styles.patientCell}>
          <Avatar name={row.name || `Patient ${row.patientId}`} size="sm" />
          <div className={styles.patientMeta}>
            <span className={styles.patientName}>{row.name || row.patientId}</span>
            <span className={styles.patientSub}>{row.district || 'Rural Center'}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'patientId',
      header: 'Patient ID',
      sortable: true,
      accessor: 'patientId',
      align: 'center',
      hideOnMobile: true,
      cell: (row) => <span className={styles.patientIdBadge}>{row.patientId}</span>,
    },
    {
      id: 'registrationDate',
      header: 'Registration Date',
      sortable: true,
      accessor: 'registrationDate',
      align: 'center',
      hideOnMobile: true,
      cell: (row) => <span>{formatDate(row.registrationDate)}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'center',
      width: 140,
      cell: (row) => (
        <RowActions
          onView={() => navigate(`/patients/${row.id}`)}
          onEdit={canUpdate ? () => handleOpenModal(row) : undefined}
          onDelete={canDelete ? () => setDeletingPatient(row) : undefined}
          canEdit={canUpdate}
          canDelete={canDelete}
        />
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Patient Directory"
        subtitle="Manage secure, anonymized clinical patient registry records."
        action={
          canCreate ? (
            <PrimaryButton
              icon={<UserPlus size={16} />}
              onClick={() => handleOpenModal()}
            >
              Register Patient
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
            placeholder="Search by patient name, ID, or clinic..."
          />
        </div>

        <div className={styles.filtersGroup}>
          <FilterSelect
            value={genderFilter}
            options={GENDER_OPTIONS}
            onChange={setGenderFilter}
            placeholder="All Genders"
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

      {/* Generic DataTable */}
      <DataTable
        columns={columns}
        data={filteredPatients}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle="No patient records found"
        emptyDescription="No patients match your selected filters. Try clearing filters or register a new patient."
        emptyAction={
          canCreate ? (
            <PrimaryButton
              icon={<UserPlus size={16} />}
              onClick={() => handleOpenModal()}
              size="sm"
            >
              Register Patient
            </PrimaryButton>
          ) : undefined
        }
      />

      {/* Register / Edit Patient Modal */}
      {isModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingPatient ? 'Edit Patient Record' : 'Register New Patient'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className={styles.closeBtn}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form} noValidate>
              <FormField
                label="Full Name"
                placeholder="e.g. Ramesh Kulkarni"
                error={errors.name?.message}
                required
                {...register('name')}
              />

              <FormField
                label="Age (Years)"
                type="number"
                placeholder="e.g. 42"
                error={errors.age?.message}
                required
                {...register('age', { valueAsNumber: true })}
              />

              <FormField
                as="select"
                label="Gender"
                error={errors.gender?.message as string | undefined}
                required
                {...register('gender')}
              >
                <option value="" disabled>Select patient gender...</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </FormField>

              <FormField
                label="District / Health Sub-Center"
                placeholder="e.g. Raigad Rural Clinic"
                error={errors.district?.message}
                required
                {...register('district')}
              />

              <div className={styles.modalActions}>
                <SecondaryButton type="button" onClick={handleClearAll}>
                  Clear All
                </SecondaryButton>
                <SecondaryButton type="button" onClick={handleCloseModal}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  disabled={isFormIncomplete}
                  isLoading={createPatientMutation.isPending || updatePatientMutation.isPending}
                >
                  {editingPatient ? 'Save Changes' : 'Register Patient'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingPatient)}
        title="Confirm Patient Deletion"
        message={`Are you sure you want to permanently delete patient ${deletingPatient?.patientId}? This action cannot be reversed.`}
        confirmLabel="Delete Patient"
        isLoading={deletePatientMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingPatient(null)}
      />
    </PageContainer>
  );
};

export default Patients;
