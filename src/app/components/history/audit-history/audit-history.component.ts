import { Component, OnInit } from '@angular/core';
import { AuditLogService } from '../../../services/audit-log.service';
import { AuditLog } from '../../../models/audit-log.model';

@Component({
  selector: 'app-audit-history',
  templateUrl: './audit-history.component.html',
  styleUrls: ['./audit-history.component.scss']
})
export class AuditHistoryComponent implements OnInit {
  auditLogs: AuditLog[] = [];
  displayedColumns: string[] = ['timestamp', 'username', 'summary', 'action', 'entityType', 'entityName', 'changes'];
  filteredLogs: AuditLog[] = [];
  filterType: 'all' | 'medicine' | 'user' = 'all';
  filterAction: 'all' | 'create' | 'update' | 'delete' = 'all';
  isLoading = false;
  searchText = '';

  constructor(private readonly auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.isLoading = true;
    this.auditLogService.getAllLogs().subscribe({
      next: (logArray) => {
        // Ensure timestamps are Date objects and handle empty array
        if (logArray && Array.isArray(logArray) && logArray.length > 0) {
          this.auditLogs = logArray.map(log => ({
            ...log,
            timestamp: typeof log.timestamp === 'string' ? new Date(log.timestamp) : log.timestamp || new Date()
          })).sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateB - dateA;
          });
        } else {
          this.auditLogs = [];
        }
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        this.auditLogs = [];
        this.filteredLogs = [];
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const q = (this.searchText || '').trim().toLowerCase();
    this.filteredLogs = this.auditLogs.filter(log => {
      const typeMatch = this.filterType === 'all' || log.entityType === this.filterType;
      const actionMatch = this.filterAction === 'all' || log.action === this.filterAction;
      const textMatch = !q || [log.username, log.entityName, log.entityType, log.action, log.description]
        .filter(Boolean)
        .some(v => ('' + v).toLowerCase().includes(q));
      return typeMatch && actionMatch && textMatch;
    });
  }

  exportCsv(): void {
    if (!this.filteredLogs || this.filteredLogs.length === 0) return;
    const rows = this.filteredLogs.map(l => ({
      timestamp: new Date(l.timestamp).toISOString(),
      action: l.action,
      type: l.entityType,
      item: l.entityName,
      user: l.username,
      description: l.description || '',
      changes: l.changes ? l.changes.map(c => `${c.field}:${c.oldValue}->${c.newValue}`).join('; ') : ''
    }));
    const header = Object.keys(rows[0]).join(',') + '\n';
  const csv = header + rows.map(r => Object.values(r).map(v => '"' + (''+v).replaceAll('"', '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-history-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'create':
        return 'add_circle';
      case 'update':
        return 'edit';
      case 'delete':
        return 'delete';
      default:
        return 'info';
    }
  }

  getActionColor(action: string): string {
    switch (action) {
      case 'create':
        return 'primary';
      case 'update':
        return 'accent';
      case 'delete':
        return 'warn';
      default:
        return 'primary';
    }
  }

  formatChanges(changes?: { field: string; oldValue: any; newValue: any }[]): string {
    if (!changes || changes.length === 0) {
      return 'No changes tracked';
    }
    return changes.map(c => `${c.field}: ${c.oldValue} → ${c.newValue}`).join(', ');
  }

  getActionVerb(action: string): string {
    switch (action) {
      case 'create':
        return 'created';
      case 'update':
        return 'updated';
      case 'delete':
        return 'deleted';
      default:
        return action + 'd';
    }
  }
}

