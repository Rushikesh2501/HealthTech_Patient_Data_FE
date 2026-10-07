import apiClient from '../../../services/api';
import {
  SeasonalTrendPoint,
  EncounterTrendPoint,
  AgeDistributionPoint,
} from '../../../types/dashboard';

export const analyticsApi = {
  /**
   * Fetch multi-condition seasonal illness trajectory directly from FastAPI
   */
  async getSeasonalTrends(): Promise<SeasonalTrendPoint[]> {
    const res = await apiClient.get<any>('/analytics/trends');
    if (Array.isArray(res.data)) return res.data;
    if (res.data?.seasonal_trends) return res.data.seasonal_trends;
    return [];
  },

  /**
   * Fetch longitudinal encounter frequency directly from FastAPI
   */
  async getEncounterTrends(range: string = '30d'): Promise<EncounterTrendPoint[]> {
    const res = await apiClient.get<any>('/dashboard/trends', {
      params: { range },
    });
    if (Array.isArray(res.data)) return res.data;
    if (res.data?.trends) return res.data.trends;
    if (res.data?.encounter_trends) return res.data.encounter_trends;
    return [];
  },

  /**
   * Fetch demographic cohort breakdown directly from FastAPI
   */
  async getAgeDistribution(): Promise<AgeDistributionPoint[]> {
    const res = await apiClient.get<any>('/dashboard/age-distribution');
    if (Array.isArray(res.data)) return res.data;
    if (res.data?.data) return res.data.data;
    return [];
  },
};

export default analyticsApi;
