import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './PatientDetails.module.css';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton/SecondaryButton';
import { Avatar } from '../../components/Avatar/Avatar';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { DataTable, Column } from '../../components/DataTable/DataTable';
import { LoadingState } from '../../components/LoadingState/LoadingState';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { EncounterModal } from '../Encounters/EncounterModal';
import { usePatient } from '../../hooks/usePatients';
import { usePatientEncounters } from '../../hooks/useEncounters';
import { useAuth } from '../../hooks/useAuth';
import { Encounter } from '../../types/encounter';
import { formatDate } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

export const PatientDetails: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [isEncounterModalOpen, setIsEncounterModalOpen] = useState(false);

  const {
    data: patient,
    isLoading: isPatientLoading,
    isError: isPatientError,
    refetch: refetchPatient,
  } = usePatient(id);

  const {
    data: encounters = [],
    isLoading: isEncountersLoading,
    refetch: refetchEncounters,
  } = usePatientEncounters(patient?.id || id);

  const canCreateEncounter = hasPermission('encounters.create');

  if (isPatientLoading) {
    return (
      <PageContainer>
        <LoadingState message="Retrieving patient file..." />
      </PageContainer>
    );
  }

  if (isPatientError || !patient) {
    return (
      <PageContainer>
        <ErrorState
          title="Patient Record Not Found"
          message="Could not find patient details with the specified identifier."
          onRetry={() => refetchPatient()}
        />
        <SecondaryButton
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate(ROUTES.PATIENTS)}
          style={{ width: 'fit-content' }}
        >
          Back to Directory
        </SecondaryButton>
      </PageContainer>
    );
  }

  const encounterColumns: Column<Encounter>[] = [
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
      sortable: false,
      accessor: 'symptoms',
      cell: (row) => (
        <span style={{ maxWidth: '240px', display: 'inline-block' }}>{row.symptoms}</span>
      ),
    },
    {
      id: 'diagnosis',
      header: 'Diagnosis',
      sortable: true,
      accessor: 'diagnosis',
      cell: (row) => <span style={{ fontWeight: 600 }}>{row.diagnosis}</span>,
    },
    {
      id: 'treatment',
      header: 'Treatment Plan',
      accessor: 'treatment',
      cell: (row) => (
        <span style={{ maxWidth: '280px', display: 'inline-block' }}>{row.treatment}</span>
      ),
    },
    {
      id: 'vitals',
      header: 'Vitals (Temp / BP)',
      cell: (row) => (
        <span>
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
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={patient.name ? `${patient.name} (${patient.patientId})` : `Patient Details - ${patient.patientId}`}
        subtitle="Review demographic details and longitudinal clinical encounter history."
        action={
          <SecondaryButton
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate(ROUTES.PATIENTS)}
          >
            Back to Directory
          </SecondaryButton>
        }
      />

      {/* Patient Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileLeft}>
          <Avatar name={patient.name || `Patient ${patient.patientId}`} size="lg" />
          <div className={styles.profileInfo}>
            <div className={styles.patientIdTitle}>
              <span>{patient.name || patient.patientId}</span>
              <StatusBadge status={patient.status} />
            </div>
            <p className={styles.clinicSub}>
              <strong style={{ color: 'var(--color-primary-600, #2563eb)' }}>{patient.patientId}</strong> • {patient.district || 'Rural Telemedicine Clinic'}
            </p>
          </div>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Age</span>
            <span className={styles.metricValue}>{patient.age} years</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Gender</span>
            <span className={styles.metricValue}>{patient.gender}</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Registered</span>
            <span className={styles.metricValue}>{formatDate(patient.registrationDate)}</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Total Encounters</span>
            <span className={styles.metricValue}>{encounters.length}</span>
          </div>
        </div>
      </div>

      {/* Encounter History Section */}
      <div className={styles.historyHeader}>
        <h2 className={styles.historyTitle}>Encounter History</h2>
        {canCreateEncounter && (
          <PrimaryButton
            icon={<PlusCircle size={16} />}
            onClick={() => setIsEncounterModalOpen(true)}
          >
            New Encounter
          </PrimaryButton>
        )}
      </div>

      <DataTable
        columns={encounterColumns}
        data={encounters}
        isLoading={isEncountersLoading}
        onRetry={() => refetchEncounters()}
        emptyTitle="No encounters recorded yet"
        emptyDescription="This patient does not have any recorded medical encounters. Add the initial encounter using the button above."
        emptyAction={
          canCreateEncounter ? (
            <PrimaryButton
              icon={<PlusCircle size={16} />}
              onClick={() => setIsEncounterModalOpen(true)}
              size="sm"
            >
              Add Initial Encounter
            </PrimaryButton>
          ) : undefined
        }
      />

      {/* Encounter Creation Modal */}
      {isEncounterModalOpen && (
        <EncounterModal
          isOpen={isEncounterModalOpen}
          initialPatientId={patient.id}
          onClose={() => setIsEncounterModalOpen(false)}
        />
      )}
    </PageContainer>
  );
};

export default PatientDetails;
