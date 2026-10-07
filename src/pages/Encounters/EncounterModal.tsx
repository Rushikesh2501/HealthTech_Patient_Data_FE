import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './EncounterModal.module.css';
import { X, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { encounterSchema, EncounterSchemaType } from '../../utils/validators';
import { FormField } from '../../components/FormField/FormField';
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton/SecondaryButton';
import { usePatients } from '../../hooks/usePatients';
import { useCreateEncounter, useUpdateEncounter } from '../../hooks/useEncounters';
import { Encounter, EncounterStatus } from '../../types/encounter';
import { COMMON_DIAGNOSES, STATUS_OPTIONS, STORAGE_KEYS } from '../../utils/constants';

export interface EncounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEncounter?: Encounter | null;
  initialPatientId?: string;
}

export const EncounterModal: React.FC<EncounterModalProps> = ({
  isOpen,
  onClose,
  editingEncounter,
  initialPatientId,
}) => {
  const { data: patients = [] } = usePatients();
  const createMutation = useCreateEncounter();
  const updateMutation = useUpdateEncounter();

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [hasDraftRestored, setHasDraftRestored] = useState(false);

  const defaultValues: Partial<EncounterSchemaType> = {
    patientId: initialPatientId || (patients[0]?.id ?? ''),
    encounterDate: new Date().toISOString().slice(0, 10),
    symptoms: '',
    diagnosis: COMMON_DIAGNOSES[0],
    treatment: '',
    temperature: '98.6',
    bloodPressure: '120/80',
    status: 'completed',
    notes: '',
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EncounterSchemaType>({
    resolver: zodResolver(encounterSchema),
    defaultValues,
  });

  // Watch form fields to auto-save drafts locally when creating new encounter
  const formValues = watch();

  useEffect(() => {
    if (!editingEncounter && isOpen) {
      const savedDraft = localStorage.getItem(STORAGE_KEYS.ENCOUNTER_DRAFT);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          reset({
            ...defaultValues,
            ...parsed,
            patientId: initialPatientId || parsed.patientId || defaultValues.patientId,
          });
          setHasDraftRestored(true);
          return;
        } catch {
          // ignore draft parse error
        }
      }
    }

    if (editingEncounter) {
      reset({
        patientId: editingEncounter.patientId,
        encounterDate: editingEncounter.date.slice(0, 10),
        symptoms: editingEncounter.symptoms,
        diagnosis: editingEncounter.diagnosis,
        treatment: editingEncounter.treatment,
        temperature: editingEncounter.temperature,
        bloodPressure: editingEncounter.bloodPressure,
        status: editingEncounter.status,
        notes: editingEncounter.notes || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingEncounter, isOpen, initialPatientId, reset]);

  // Persist draft on changes (if not editing an existing record)
  useEffect(() => {
    if (!editingEncounter && isOpen && formValues.symptoms) {
      localStorage.setItem(STORAGE_KEYS.ENCOUNTER_DRAFT, JSON.stringify(formValues));
    }
  }, [formValues, editingEncounter, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: EncounterSchemaType) => {
    setFeedback(null);
    try {
      if (editingEncounter) {
        await updateMutation.mutateAsync({
          id: editingEncounter.id,
          data: {
            patientId: data.patientId,
            date: data.encounterDate,
            symptoms: data.symptoms,
            diagnosis: data.diagnosis,
            treatment: data.treatment,
            temperature: data.temperature,
            bloodPressure: data.bloodPressure,
            status: data.status as EncounterStatus,
            notes: data.notes,
          },
        });
        setFeedback({ type: 'success', message: 'Encounter updated successfully!' });
      } else {
        await createMutation.mutateAsync({
          patientId: data.patientId,
          encounterDate: data.encounterDate,
          symptoms: data.symptoms,
          diagnosis: data.diagnosis,
          treatment: data.treatment,
          temperature: data.temperature,
          bloodPressure: data.bloodPressure,
          status: data.status as EncounterStatus,
          notes: data.notes,
        });
        // Clear saved draft upon successful creation
        localStorage.removeItem(STORAGE_KEYS.ENCOUNTER_DRAFT);
        setFeedback({ type: 'success', message: 'Encounter created and recorded successfully!' });
      }

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to record encounter. Please check data.',
      });
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem(STORAGE_KEYS.ENCOUNTER_DRAFT);
    reset(defaultValues);
    setHasDraftRestored(false);
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h3 className={styles.title}>
              {editingEncounter ? 'Edit Patient Encounter' : 'Record New Clinical Encounter'}
            </h3>
            <p className={styles.subtitle}>
              Document real-time clinical observations, vitals, and treatment.
            </p>
            {hasDraftRestored && !editingEncounter && (
              <span className={styles.draftNotice}>
                ✓ Auto-restored previously saved encounter draft
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.body}>
            {feedback && (
              <div
                className={`${styles.feedbackAlert} ${
                  feedback.type === 'success' ? styles.successAlert : styles.errorAlert
                }`}
                role="alert"
              >
                {feedback.type === 'success' ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className={styles.grid2}>
              <FormField
                as="select"
                label="Patient Record"
                error={errors.patientId?.message}
                required
                {...register('patientId')}
              >
                <option value="">Select a registered patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.patientId} - {p.gender}, {p.age} yrs ({p.district})
                  </option>
                ))}
              </FormField>

              <FormField
                label="Encounter Date"
                type="date"
                error={errors.encounterDate?.message}
                required
                {...register('encounterDate')}
              />
            </div>

            <FormField
              as="textarea"
              label="Presenting Symptoms"
              placeholder="Describe chief complaint, onset, and duration..."
              rows={2}
              error={errors.symptoms?.message}
              required
              {...register('symptoms')}
            />

            <div className={styles.grid2}>
              <FormField
                as="select"
                label="Clinical Diagnosis"
                error={errors.diagnosis?.message}
                required
                {...register('diagnosis')}
              >
                {COMMON_DIAGNOSES.map((diag) => (
                  <option key={diag} value={diag}>
                    {diag}
                  </option>
                ))}
              </FormField>

              <FormField
                as="select"
                label="Encounter Status"
                error={errors.status?.message as string | undefined}
                {...register('status')}
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </FormField>
            </div>

            <FormField
              as="textarea"
              label="Treatment Plan / Prescriptions"
              placeholder="Medications, dosage, lifestyle recommendations, follow-up..."
              rows={2}
              error={errors.treatment?.message}
              required
              {...register('treatment')}
            />

            <div className={styles.grid2}>
              <FormField
                label="Body Temperature (°F)"
                type="text"
                placeholder="e.g. 98.6"
                hint="Normal: 97.0 - 99.0°F"
                error={errors.temperature?.message}
                required
                {...register('temperature')}
              />

              <FormField
                label="Blood Pressure (mmHg)"
                type="text"
                placeholder="e.g. 120/80"
                hint="Format: Systolic/Diastolic"
                error={errors.bloodPressure?.message}
                required
                {...register('bloodPressure')}
              />
            </div>

            <FormField
              label="Clinical Telemedicine Notes (Optional)"
              placeholder="Private clinician observations or referral flags..."
              {...register('notes')}
            />
          </div>

          <div className={styles.footer}>
            <div>
              {hasDraftRestored && !editingEncounter && (
                <SecondaryButton
                  type="button"
                  size="sm"
                  onClick={handleClearDraft}
                >
                  Clear Draft
                </SecondaryButton>
              )}
            </div>

            <div className={styles.footerRight}>
              <SecondaryButton type="button" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
                icon={<Save size={16} />}
              >
                {editingEncounter ? 'Update Encounter' : 'Record Encounter'}
              </PrimaryButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EncounterModal;
