export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'LOGIN' 
  | 'LOGIN_FAILED' 
  | 'UNAUTHORIZED_ACCESS';

export type AuditStatus = 'completed' | 'failed' | 'pending' | 'active';

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  status: AuditStatus;
  ipAddress?: string;
  details?: string;
}
