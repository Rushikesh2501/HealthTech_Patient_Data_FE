import apiClient from '../../../services/api';
import { Patient, PatientFormData } from '../../../types/patient';

export const patientsApi = {
  /**
   * Retrieve all anonymized patient records directly from FastAPI
   */
  async getPatients(): Promise<Patient[]> {
    const res = await apiClient.get<any>('/patients');
    const items = Array.isArray(res.data)
      ? res.data
      : res.data && Array.isArray(res.data.data)
      ? res.data.data
      : [];
    return items.map((p: any) => ({
      ...p,
      id: String(p.id),
    }));
  },

  /**
   * Retrieve a specific patient by ID directly from FastAPI
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
   * Register a new patient directly via FastAPI
   */
  async createPatient(data: PatientFormData): Promise<Patient> {
    const res = await apiClient.post<any>('/patients', data);
    const p = res.data;
    return {
      ...p,
      id: String(p.id),
    };
  },

  /**
   * Update existing patient information directly via FastAPI
   */
  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    const res = await apiClient.patch<any>(`/patients/${id}`, data);
    const p = res.data;
    return {
      ...p,
      id: String(p.id),
    };
  },

  /**
   * Delete a patient record directly via FastAPI
   */
  async deletePatient(id: string): Promise<boolean> {
    await apiClient.delete(`/patients/${id}`);
    return true;
  },
};

export default patientsApi;
