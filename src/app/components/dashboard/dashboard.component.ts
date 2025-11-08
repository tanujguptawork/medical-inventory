import { Component, OnInit } from '@angular/core';
import { MedicineService } from '../../services/medicine.service';
import { Medicine } from '../../models/medicine.model';
import { AuditLogService } from '../../services/audit-log.service';
import { AuditLog } from '../../models/audit-log.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  totalMedicines = 0;
  totalStock = 0;
  lowStockCount = 0;
  expiringSoonCount = 0;
  // categories removed per request
  lowStockMedicines: Medicine[] = [];
  expiringMedicines: Medicine[] = [];
  recentLogs: AuditLog[] = [];

  constructor(
    private readonly medicineService: MedicineService,
    private readonly auditLogService: AuditLogService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.medicineService.getAllMedicines().subscribe(medicines => {
      this.totalMedicines = medicines.length;
      this.totalStock = medicines.reduce((sum, m) => sum + m.quantity, 0);
      
      // Calculate low stock
      this.medicineService.getLowStockMedicines().subscribe(lowStock => {
        this.lowStockCount = lowStock.length;
        this.lowStockMedicines = lowStock;
      });
      
      // Calculate expiring soon (within 90 days)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const days90FromNow = new Date();
      days90FromNow.setDate(today.getDate() + 90);
      days90FromNow.setHours(23, 59, 59, 999);
      
      this.expiringMedicines = medicines.filter(m => {
        const expiryDate = new Date(m.expiryDate);
        expiryDate.setHours(0, 0, 0, 0);
        return expiryDate >= today && expiryDate <= days90FromNow;
      });
      this.expiringSoonCount = this.expiringMedicines.length;

      // Categories calculation removed
    });

    // Recent activity (last 5 logs)
    this.auditLogService.getAllLogs().subscribe(logs => {
      this.recentLogs = (logs || [])
        .sort((a, b) => new Date(b.timestamp as any).getTime() - new Date(a.timestamp as any).getTime())
        .slice(0, 5);
    });
  }

    /**
     * Normalize backend action names to the UI labels requested by the user.
     * - create -> add
     * - add -> add
     * - update | edit -> update
     * - delete | remove -> delete
     * Any unknown action is returned as-is.
     */
    mapAction(action: string | undefined): string {
      if (!action) return '';
      const a = action.toLowerCase();
      if (a === 'create' || a === 'add') return 'add';
      if (a === 'update' || a === 'edit') return 'update';
      if (a === 'delete' || a === 'remove') return 'delete';
      return action;
    }
}

