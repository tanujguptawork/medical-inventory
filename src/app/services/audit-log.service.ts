import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AuditLog } from '../models/audit-log.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private readonly auditLogsSubject = new BehaviorSubject<AuditLog[]>([]);
  public readonly auditLogs$ = this.auditLogsSubject.asObservable();
  private readonly storageKey = 'audit_logs_data';

  // Toggle: set to true when API integration is ready
  private readonly useApi = false;

  constructor(
    private readonly authService: AuthService
  ) {
    this.loadLogsFromStorage();
  }

  /** Add a new audit log (localStorage-backed). */
  async addLog(
    action: AuditLog['action'],
    entityType: AuditLog['entityType'],
    entityId: string,
    entityName: string,
    changes?: AuditLog['changes'],
    description?: string
  ): Promise<void> {
    const user = this.authService.getCurrentUser?.() ?? null;
    const log: AuditLog = {
      id: this.generateId(),
      action,
      entityType,
      entityId,
      entityName,
      userId: user?.id ?? 'anonymous',
      username: user?.username ?? 'anonymous',
      timestamp: new Date(),
      changes,
      description
    };

    const updated = [log, ...this.auditLogsSubject.value].slice(0, 1000); // cap 1000
    this.auditLogsSubject.next(updated);
    this.saveLogsToStorage(updated);

    // Placeholder for API upload (kept commented):
    // if (this.useApi) { await this.apiService.createLog(log).toPromise(); }
  }

  /**
   * Backwards-compatible method used across the app.
   * Signature: logAction(action, entityType, entityId, entityName, changes?, description?)
   */
  public async logAction(
    action: AuditLog['action'],
    entityType: AuditLog['entityType'],
    entityId: string,
    entityName: string,
    changes?: AuditLog['changes'],
    description?: string
  ): Promise<void> {
    return this.addLog(action, entityType, entityId, entityName, changes, description);
  }

  /** Search logs locally. */
  searchLogs(query: string): Observable<AuditLog[]> {
    const q = (query || '').toLowerCase();
    const filtered = this.auditLogsSubject.value.filter(log =>
      log.action.toLowerCase().includes(q) ||
      log.entityName.toLowerCase().includes(q) ||
      log.username.toLowerCase().includes(q) ||
      (log.description ? log.description.toLowerCase().includes(q) : false)
    );

    const sorted = [...filtered].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return of(sorted);
  }

  getAllLogs(): Observable<AuditLog[]> {
    return this.auditLogs$;
  }

  getLogsByEntity(entityType: AuditLog['entityType'], entityId?: string): Observable<AuditLog[]> {
    const logs = this.auditLogsSubject.value.filter(l => l.entityType === entityType && (!entityId || l.entityId === entityId));
    const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return of(sorted);
  }

  getMedicineHistory(medicineId: string): Observable<AuditLog[]> {
    return this.getLogsByEntity('medicine', medicineId);
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private loadLogsFromStorage(): void {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) { this.auditLogsSubject.next([]); return; }

    try {
      const parsed = JSON.parse(raw) as AuditLog[];
      const normalized = parsed.map(p => ({ ...p, timestamp: typeof p.timestamp === 'string' ? new Date(p.timestamp) : p.timestamp }));
      this.auditLogsSubject.next(normalized);
    } catch (e) {
      console.error('Failed to parse audit logs from storage', e);
      this.auditLogsSubject.next([]);
    }
  }

  private saveLogsToStorage(logs: AuditLog[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save audit logs to storage', e);
    }
  }
}

