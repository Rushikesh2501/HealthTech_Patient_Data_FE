import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '../pages/Patients/api';
import { PatientFormData, Patient } from '../types/patient';

export const PATIENTS_QUERY_KEY = ['patients'];
export const patientDetailQueryKey = (id: string) => ['patient', id];

export const usePatients = () => {
  return useQuery({
    queryKey: PATIENTS_QUERY_KEY,
    queryFn: () => patientsApi.getPatients(),
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: patientDetailQueryKey(id),
    queryFn: () => patientsApi.getPatient(id),
    enabled: Boolean(id),
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatientFormData) => patientsApi.createPatient(data),
    onSuccess: () => {
      // Invalidate patients list & dashboard metrics immediately
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) =>
      patientsApi.updatePatient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: patientDetailQueryKey(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => patientsApi.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
