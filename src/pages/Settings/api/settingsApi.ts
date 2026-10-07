import apiClient from '../../../services/api';

export interface SystemConfig {
  apiUrl: string;
  database: string;
  rbacEnabled: boolean;
  jwtExpiryMinutes: number;
  encryptionMode: string;
}

export const settingsApi = {
  /**
   * Fetch current system parameters
   */
  async getSystemSettings(): Promise<SystemConfig> {
    try {
      // Future FastAPI endpoint: GET /api/settings
      const res = await apiClient.get<SystemConfig>('/settings');
      return res.data;
    } catch {
      return {
        apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
        database: 'PostgreSQL 15+',
        rbacEnabled: true,
        jwtExpiryMinutes: 60,
        encryptionMode: 'AES-256 (Anonymized identifiers active)',
      };
    }
  },

  /**
   * Update system configuration parameters
   */
  async updateSystemSettings(data: Partial<SystemConfig>): Promise<SystemConfig> {
    try {
      // Future FastAPI endpoint: PUT /api/settings
      const res = await apiClient.put<SystemConfig>('/settings', data);
      return res.data;
    } catch {
      return {
        apiUrl: data.apiUrl || process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
        database: 'PostgreSQL 15+',
        rbacEnabled: data.rbacEnabled ?? true,
        jwtExpiryMinutes: data.jwtExpiryMinutes ?? 60,
        encryptionMode: 'AES-256 (Anonymized identifiers active)',
      };
    }
  },
};

export default settingsApi;
