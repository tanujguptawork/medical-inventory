import { Component, OnInit } from '@angular/core';
import { AuditLogService } from '../../../services/audit-log.service';
import { AuditLog } from '../../../models/audit-log.model';

@Component({
  selector: 'app-recent-activity',
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss']
})
export class RecentActivityComponent implements OnInit {
  recentLogs: AuditLog[] = [];

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.loadRecentLogs();
  }

  loadRecentLogs(): void {
    this.auditLogService.getAllLogs().subscribe(logs => {
      this.recentLogs = (logs || [])
        .sort((a, b) => new Date(b.timestamp as any).getTime() - new Date(a.timestamp as any).getTime())
        .slice(0, 50);
    });
  }

  mapAction(action: string | undefined): string {
    if (!action) return '';
    const a = action.toLowerCase();
    if (a === 'create' || a === 'add') return 'add';
    if (a === 'update' || a === 'edit') return 'update';
    if (a === 'delete' || a === 'remove') return 'delete';
    return action;
  }
}
