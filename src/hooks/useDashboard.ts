import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../pages/Dashboard/api';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => dashboardApi.getSummary(),
  });
};

export const useEncounterTrends = (range: string = '7d') => {
  return useQuery({
    queryKey: ['dashboard', 'trends', range],
    queryFn: () => dashboardApi.getEncounterTrends(range),
  });
};

export const useDiagnosisTrends = () => {
  return useQuery({
    queryKey: ['dashboard', 'diagnosis'],
    queryFn: () => dashboardApi.getDiagnosisDistribution(),
  });
};

export const useAgeDistribution = () => {
  return useQuery({
    queryKey: ['dashboard', 'ageDistribution'],
    queryFn: () => dashboardApi.getAgeDistribution(),
  });
};

export const useSeasonalTrends = () => {
  return useQuery({
    queryKey: ['dashboard', 'seasonalTrends'],
    queryFn: () => dashboardApi.getEncounterTrends('30d'),
  });
};
