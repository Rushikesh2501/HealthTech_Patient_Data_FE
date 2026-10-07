export type EncounterStatus = 
  | 'scheduled' 
  | 'completed' 
  | 'active' 
  | 'inactive' 
  | 'cancelled' 
  | 'pending' 
  | 'failed';

export interface Encounter {
  id: string;
  encounterId: string;
  patientId: string;
  patientDisplayId: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  clinician: string;
  temperature: string;      // e.g. "98.6 °F"
  bloodPressure: string;    // e.g. "120/80 mmHg"
  status: EncounterStatus;
  notes?: string;
  createdAt?: string;
}

export interface EncounterFormData {
  patientId: string;
  encounterDate: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  temperature: string;
  bloodPressure: string;
  clinician?: string;
  status?: EncounterStatus;
  notes?: string;
}
