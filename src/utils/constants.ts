export const STORAGE_KEYS = {
  AUTH_TOKEN: 'pm_auth_token',
  REFRESH_TOKEN: 'pm_refresh_token',
  USER_DATA: 'pm_user_data',
  ENCOUNTER_DRAFT: 'pm_encounter_draft',
  THEME_MODE: 'pm_theme_mode',
};

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PATIENTS: '/patients',
  PATIENT_DETAILS: '/patients/:id',
  ENCOUNTERS: '/encounters',
  ANALYTICS: '/analytics',
  USERS: '/users',
  AUDIT_LOGS: '/audit-logs',
  AUDIT_LOG_DETAILS: '/audit-logs/:id',
  SETTINGS: '/settings',
  RBAC: '/rbac',
};

export const DATE_RANGE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
] as const;

export const COMMON_DIAGNOSES = [
  'Acute Respiratory Infection',
  'Hypertension (Primary)',
  'Type 2 Diabetes Mellitus',
  'Acute Gastroenteritis',
  'Malaria (P. vivax)',
  'Dengue Fever',
  'Iron Deficiency Anemia',
  'Bronchial Asthma',
  'Urinary Tract Infection',
  'Dermatitis / Eczema',
  'Tuberculosis Evaluation',
  'General Preventive Checkup',
];

export const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

export const STATUS_OPTIONS = [
  { label: 'Completed', value: 'completed' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Failed', value: 'failed' },
];
