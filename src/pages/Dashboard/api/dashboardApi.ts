import apiClient from '../../../services/api';
import {
  DashboardSummary,
  EncounterTrendPoint,
  DiagnosisDistributionPoint,
  AgeDistributionPoint,
} from '../../../types/dashboard';

export const dashboardApi = {
  /**
   * Fetch aggregate clinical metrics summary directly from FastAPI
   */
  async getSummary(): Promise<DashboardSummary> {
    const res = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return res.data;
  },

  /**
   * Fetch encounter volume trends directly from FastAPI
   */
  async getEncounterTrends(range: string = '7d'): Promise<EncounterTrendPoint[]> {
    const res = await apiClient.get<any>('/dashboard/trends', {
      params: { range },
    });
    return Array.isArray(res.data) ? res.data : res.data?.trends || [];
  },

  /**
   * Fetch distribution of diagnoses directly from FastAPI
   */
  async getDiagnosisDistribution(): Promise<DiagnosisDistributionPoint[]> {
    const res = await apiClient.get<any>('/dashboard/diagnoses');
    return Array.isArray(res.data) ? res.data : res.data?.diagnoses || [];
  },

  /**
   * Fetch patient age and demographic breakdown directly from FastAPI
   */
  async getAgeDistribution(): Promise<AgeDistributionPoint[]> {
    const res = await apiClient.get<any>('/dashboard/age-distribution');
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
  },
};

export default dashboardApi;
