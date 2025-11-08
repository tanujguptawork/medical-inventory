export interface AuditLog {
  id?: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'medicine' | 'user';
  entityId: string;
  entityName: string;
  userId: string;
  username: string;
  timestamp: Date | string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  description?: string;
}


