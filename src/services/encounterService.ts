import { Encounter, EncounterFormData } from '../types/encounter';
import { INITIAL_ENCOUNTERS } from './mockData';
import { patientService } from './patientService';

const ENCOUNTERS_STORAGE_KEY = 'pm_encounters_data';
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredEncounters = (): Encounter[] => {
  const data = localStorage.getItem(ENCOUNTERS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(ENCOUNTERS_STORAGE_KEY, JSON.stringify(INITIAL_ENCOUNTERS));
    return INITIAL_ENCOUNTERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_ENCOUNTERS;
  }
};

const saveStoredEncounters = (encounters: Encounter[]) => {
  localStorage.setItem(ENCOUNTERS_STORAGE_KEY, JSON.stringify(encounters));
};

export const encounterService = {
  async getEncounters(): Promise<Encounter[]> {
    await delay();
    return getStoredEncounters();
  },

  async getEncounter(id: string): Promise<Encounter> {
    await delay();
    const encounters = getStoredEncounters();
    const found = encounters.find((e) => e.id === id || e.encounterId === id);
    if (!found) {
      throw new Error(`Encounter with ID "${id}" not found.`);
    }
    return found;
  },

  async getEncountersByPatient(patientId: string): Promise<Encounter[]> {
    await delay();
    const encounters = getStoredEncounters();
    return encounters.filter(
      (e) => e.patientId === patientId || e.patientDisplayId === patientId
    );
  },

  async createEncounter(data: EncounterFormData): Promise<Encounter> {
    await delay();
    const encounters = getStoredEncounters();
    const nextIndex = encounters.length + 1001;
    const encounterId = `ENC-${nextIndex}`;

    // Look up patient to get display ID
    let patientDisplayId = data.patientId;
    try {
      const patient = await patientService.getPatient(data.patientId);
      patientDisplayId = patient.patientId;
      // Also update patient total encounters count & last encounter date
      await patientService.updatePatient(patient.id, {
        totalEncounters: (patient.totalEncounters || 0) + 1,
        lastEncounterDate: data.encounterDate,
      });
    } catch {
      // Patient might be raw ID string
    }

    const newEncounter: Encounter = {
      id: `enc-${Date.now()}`,
      encounterId,
      patientId: data.patientId,
      patientDisplayId,
      date: data.encounterDate,
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      temperature: data.temperature,
      bloodPressure: data.bloodPressure,
      clinician: data.clinician || 'Dr. Ananya Roy',
      status: data.status || 'completed',
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    const updated = [newEncounter, ...encounters];
    saveStoredEncounters(updated);
    return newEncounter;
  },

  async updateEncounter(id: string, data: Partial<Encounter>): Promise<Encounter> {
    await delay();
    const encounters = getStoredEncounters();
    const index = encounters.findIndex((e) => e.id === id || e.encounterId === id);
    if (index === -1) {
      throw new Error(`Encounter not found.`);
    }

    const updated = { ...encounters[index], ...data };
    encounters[index] = updated;
    saveStoredEncounters(encounters);
    return updated;
  },

  async deleteEncounter(id: string): Promise<boolean> {
    await delay();
    const encounters = getStoredEncounters();
    const filtered = encounters.filter((e) => e.id !== id && e.encounterId !== id);
    saveStoredEncounters(filtered);
    return true;
  },
};
