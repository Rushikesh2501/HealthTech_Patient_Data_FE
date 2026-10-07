export type Gender = 'Male' | 'Female' | 'Other';
export type PatientStatus = 'active' | 'inactive';

export interface Patient {
  id: string;
  patientId: string;
  age: number;
  gender: Gender;
  registrationDate: string;
  status: PatientStatus;
  district?: string;
  totalEncounters: number;
  lastEncounterDate?: string;
}

export interface PatientFormData {
  patientId?: string;
  age: number;
  gender: Gender;
  status?: PatientStatus;
  district?: string;
}
