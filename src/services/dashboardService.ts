import {
  DashboardSummary,
  EncounterTrendPoint,
  DiagnosisDistributionPoint,
  AgeDistributionPoint,
  SeasonalTrendPoint,
} from '../types/dashboard';
import {
  MOCK_DASHBOARD_SUMMARY,
  MOCK_ENCOUNTER_TRENDS,
  MOCK_DIAGNOSIS_DISTRIBUTION,
  MOCK_AGE_DISTRIBUTION,
  MOCK_SEASONAL_TRENDS,
} from './mockData';
import { patientService } from './patientService';
import { encounterService } from './encounterService';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    await delay();
    try {
      const [patients, encounters] = await Promise.all([
        patientService.getPatients(),
        encounterService.getEncounters(),
      ]);

      const todayStr = new Date().toISOString().slice(0, 10);
      const encountersToday = encounters.filter((e) =>
        e.date.startsWith(todayStr)
      ).length;

      // Extract unique clinicians
      const uniqueClinicians = new Set(
        encounters.map((e) => e.clinician).filter(Boolean)
      );

      return {
        totalPatients: patients.length,
        totalEncounters: encounters.length,
        encountersToday: encountersToday > 0 ? encountersToday : 3,
        activeClinicians: Math.max(uniqueClinicians.size, 4),
        patientsChangePercentage: MOCK_DASHBOARD_SUMMARY.patientsChangePercentage,
        encountersChangePercentage: MOCK_DASHBOARD_SUMMARY.encountersChangePercentage,
        todayChangePercentage: MOCK_DASHBOARD_SUMMARY.todayChangePercentage,
      };
    } catch {
      return MOCK_DASHBOARD_SUMMARY;
    }
  },

  async getEncounterTrends(range: string = '7d'): Promise<EncounterTrendPoint[]> {
    await delay();
    return MOCK_ENCOUNTER_TRENDS[range] || MOCK_ENCOUNTER_TRENDS['7d'];
  },

  async getDiagnosisTrends(): Promise<DiagnosisDistributionPoint[]> {
    await delay();
    return MOCK_DIAGNOSIS_DISTRIBUTION;
  },

  async getAgeDistribution(): Promise<AgeDistributionPoint[]> {
    await delay();
    return MOCK_AGE_DISTRIBUTION;
  },

  async getSeasonalTrends(): Promise<SeasonalTrendPoint[]> {
    await delay();
    return MOCK_SEASONAL_TRENDS;
  },
};
