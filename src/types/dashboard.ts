export interface DashboardSummary {
  totalPatients: number;
  totalEncounters: number;
  encountersToday: number;
  activeClinicians: number;
  patientsChangePercentage?: number;
  encountersChangePercentage?: number;
  todayChangePercentage?: number;
}

export interface EncounterTrendPoint {
  date: string;
  encounters: number;
  followUps?: number;
}

export interface DiagnosisDistributionPoint {
  name: string;
  count: number;
  percentage?: number;
  color?: string;
}

export interface AgeDistributionPoint {
  ageGroup: string;
  male: number;
  female: number;
  other: number;
}

export interface SeasonalTrendPoint {
  month: string;
  viralRespiratory: number;
  diabetesRelated: number;
  vectorBorne: number;
  gastrointestinal: number;
}
