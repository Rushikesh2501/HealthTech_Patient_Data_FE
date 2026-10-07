import apiClient from '../../../services/api';
import { AuditLog, AuditAction, AuditStatus } from '../../../types/audit';

export const auditLogsApi = {
  /**
   * Fetch system audit logs directly from FastAPI
   */
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await apiClient.get<any>('/audit-logs');
    if (Array.isArray(res.data)) return res.data;
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data.data.map((item: any) => ({
        ...item,
        id: String(item.id),
      }));
    }
    return [];
  },

  /**
   * Fetch single audit event details by ID
   */
  async getAuditLogById(id: string): Promise<AuditLog | undefined> {
    try {
      const res = await apiClient.get<any>(`/audit-logs/${id}`);
      if (res.data) {
        return {
          ...res.data,
          id: String(res.data.id || id),
        };
      }
    } catch {
      // fallback to list search
    }
    const all = await auditLogsApi.getAuditLogs();
    return all.find((item) => String(item.id) === String(id));
  },

  /**
   * Record a new security or transaction audit event
   */
  async logEvent(
    user: string,
    role: string,
    action: AuditAction,
    entity: string,
    entityId: string,
    status: AuditStatus = 'completed',
    details?: string
  ): Promise<AuditLog> {
    try {
      const res = await apiClient.post<any>('/audit-logs', {
        user,
        role,
        action,
        entity,
        entityId,
        status,
        details,
      });
      return res.data;
    } catch {
      return {
        id: String(Date.now()),
        timestamp: new Date().toISOString(),
        user,
        role,
        action,
        entity,
        entityId,
        status,
        details,
      };
    }
  },
};

export default auditLogsApi;
