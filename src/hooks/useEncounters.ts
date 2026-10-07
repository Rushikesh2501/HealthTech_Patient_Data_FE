import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { encountersApi } from '../pages/Encounters/api';
import { patientDetailsApi } from '../pages/PatientDetails/api';
import { EncounterFormData, Encounter } from '../types/encounter';
import { PATIENTS_QUERY_KEY } from './usePatients';

export const ENCOUNTERS_QUERY_KEY = ['encounters'];
export const patientEncountersQueryKey = (patientId: string) => [
  'encounters',
  'patient',
  patientId,
];
export const encounterDetailQueryKey = (id: string) => ['encounter', id];

export const useEncounters = () => {
  return useQuery({
    queryKey: ENCOUNTERS_QUERY_KEY,
    queryFn: () => encountersApi.getEncounters(),
  });
};

export const useEncounter = (id: string) => {
  return useQuery({
    queryKey: encounterDetailQueryKey(id),
    queryFn: () => encountersApi.getEncounter(id),
    enabled: Boolean(id),
  });
};

export const usePatientEncounters = (patientId: string) => {
  return useQuery({
    queryKey: patientEncountersQueryKey(patientId),
    queryFn: () => patientDetailsApi.getPatientEncounters(patientId),
    enabled: Boolean(patientId),
  });
};

export const useCreateEncounter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EncounterFormData) => encountersApi.createEncounter(data),
    onSuccess: (newEncounter) => {
      // Invalidate encounters list
      queryClient.invalidateQueries({ queryKey: ENCOUNTERS_QUERY_KEY });
      // Invalidate patient specific encounters list
      queryClient.invalidateQueries({
        queryKey: patientEncountersQueryKey(newEncounter.patientId),
      });
      // Invalidate patient directory to update totalEncounters & lastDate
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });
      // Invalidate dashboard metrics immediately
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateEncounter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Encounter> }) =>
      encountersApi.updateEncounter(id, data),
    onSuccess: (updatedEncounter) => {
      queryClient.invalidateQueries({ queryKey: ENCOUNTERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: patientEncountersQueryKey(updatedEncounter.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: encounterDetailQueryKey(updatedEncounter.id),
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteEncounter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => encountersApi.deleteEncounter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENCOUNTERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
