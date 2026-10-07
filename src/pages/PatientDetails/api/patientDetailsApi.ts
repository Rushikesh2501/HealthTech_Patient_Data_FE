import apiClient from '../../../services/api';
import { Patient } from '../../../types/patient';
import { Encounter } from '../../../types/encounter';

export const patientDetailsApi = {
  /**
   * Fetch specific patient details directly from FastAPI
   */
  async getPatient(id: string): Promise<Patient> {
    const res = await apiClient.get<any>(`/patients/${id}`);
    const p = res.data;
    return {
      ...p,
      id: String(p.id),
    };
  },

  /**
   * Fetch encounter history specific to this patient directly from FastAPI
   */
  async getPatientEncounters(patientId: string): Promise<Encounter[]> {
    const res = await apiClient.get<any>('/encounters', {
      params: { patientId },
    });
    const items = Array.isArray(res.data)
      ? res.data
      : res.data && Array.isArray(res.data.data)
      ? res.data.data
      : [];
    return items.map((e: any) => ({
      ...e,
      id: String(e.id),
      patientId: String(e.patientId),
    }));
  },
};

export default patientDetailsApi;
