import { AuditLog, AuditAction, AuditStatus } from '../types/audit';
import { MOCK_AUDIT_LOGS } from './mockData';

const AUDIT_STORAGE_KEY = 'pm_audit_logs';
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredAuditLogs = (): AuditLog[] => {
  const data = localStorage.getItem(AUDIT_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(MOCK_AUDIT_LOGS));
    return MOCK_AUDIT_LOGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return MOCK_AUDIT_LOGS;
  }
};

export const auditService = {
  async getAuditLogs(): Promise<AuditLog[]> {
    await delay();
    return getStoredAuditLogs();
  },

  async logAction(
    user: string,
    role: string,
    action: AuditAction,
    entity: string,
    entityId: string,
    status: AuditStatus = 'completed',
    details?: string
  ): Promise<AuditLog> {
    const logs = getStoredAuditLogs();
    const newEntry: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user,
      role: role.toUpperCase(),
      action,
      entity,
      entityId,
      status,
      ipAddress: '103.21.144.12',
      details,
    };
    const updated = [newEntry, ...logs];
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  },
};
