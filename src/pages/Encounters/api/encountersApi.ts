import apiClient from '../../../services/api';
import { Encounter, EncounterFormData } from '../../../types/encounter';

export const encountersApi = {
  /**
   * Retrieve all recorded clinical encounters directly from FastAPI
   */
  async getEncounters(): Promise<Encounter[]> {
    const res = await apiClient.get<any>('/encounters');
    const items = Array.isArray(res.data)
      ? res.data
      : res.data && Array.isArray(res.data.data)
      ? res.data.data
      : [];
    return items.map((e: any) => ({
      ...e,
      id: String(e.id),
      encounterId: e.encounterId || e.encounter_id || (e.id ? `ENC-${e.id}` : ''),
      patientId: String(e.patientId || e.patient_id || ''),
      patientDisplayId: e.patientDisplayId || e.patient_display_id || (e.patientId ? `PT-${e.patientId}` : ''),
    }));
  },

  /**
   * Retrieve a specific encounter record directly from FastAPI
   */
  async getEncounter(id: string): Promise<Encounter> {
    const res = await apiClient.get<any>(`/encounters/${id}`);
    const e = res.data;
    return {
      ...e,
      id: String(e.id),
      patientId: String(e.patientId),
    };
  },

  /**
   * Record a new encounter directly via FastAPI
   */
  async createEncounter(data: EncounterFormData): Promise<Encounter> {
    const payload = {
      ...data,
      patientId: Number(data.patientId) || data.patientId,
    };
    const res = await apiClient.post<any>('/encounters', payload);
    const e = res.data;
    return {
      ...e,
      id: String(e.id),
      patientId: String(e.patientId),
    };
  },

  /**
   * Update existing encounter information directly via FastAPI
   */
  async updateEncounter(id: string, data: Partial<Encounter>): Promise<Encounter> {
    const res = await apiClient.patch<any>(`/encounters/${id}`, data);
    const e = res.data;
    return {
      ...e,
      id: String(e.id),
      patientId: String(e.patientId),
    };
  },

  /**
   * Delete an encounter record directly via FastAPI
   */
  async deleteEncounter(id: string): Promise<boolean> {
    await apiClient.delete(`/encounters/${id}`);
    return true;
  },
};

export default encountersApi;
