import { Patient, PatientFormData } from '../types/patient';
import { INITIAL_PATIENTS } from './mockData';

const PATIENTS_STORAGE_KEY = 'pm_patients_data';
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredPatients = (): Patient[] => {
  const data = localStorage.getItem(PATIENTS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
    return INITIAL_PATIENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PATIENTS;
  }
};

const saveStoredPatients = (patients: Patient[]) => {
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
};

export const patientService = {
  async getPatients(): Promise<Patient[]> {
    await delay();
    return getStoredPatients();
  },

  async getPatient(id: string): Promise<Patient> {
    await delay();
    const patients = getStoredPatients();
    const found = patients.find((p) => p.id === id || p.patientId === id);
    if (!found) {
      throw new Error(`Patient with ID "${id}" not found.`);
    }
    return found;
  },

  async createPatient(data: PatientFormData): Promise<Patient> {
    await delay();
    const patients = getStoredPatients();
    const nextIndex = patients.length + 1;
    const patientId = `PT-${String(nextIndex).padStart(4, '0')}`;
    const newPatient: Patient = {
      id: `p-${Date.now()}`,
      patientId,
      age: Number(data.age),
      gender: data.gender,
      registrationDate: new Date().toISOString(),
      status: data.status || 'active',
      district: data.district || 'Rural Health Center',
      totalEncounters: 0,
    };

    const updated = [newPatient, ...patients];
    saveStoredPatients(updated);
    return newPatient;
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    await delay();
    const patients = getStoredPatients();
    const index = patients.findIndex((p) => p.id === id || p.patientId === id);
    if (index === -1) {
      throw new Error(`Patient not found.`);
    }

    const updatedPatient = { ...patients[index], ...data };
    patients[index] = updatedPatient;
    saveStoredPatients(patients);
    return updatedPatient;
  },

  async deletePatient(id: string): Promise<boolean> {
    await delay();
    const patients = getStoredPatients();
    const filtered = patients.filter((p) => p.id !== id && p.patientId !== id);
    saveStoredPatients(filtered);
    return true;
  },
};
