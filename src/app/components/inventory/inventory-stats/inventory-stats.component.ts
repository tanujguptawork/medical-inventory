import { Component, OnInit } from '@angular/core';
import { MedicineService } from '../../../services/medicine.service';
import { Medicine } from '../../../models/medicine.model';

@Component({
  selector: 'app-inventory-stats',
  templateUrl: './inventory-stats.component.html',
  styleUrls: ['./inventory-stats.component.scss']
})
export class InventoryStatsComponent implements OnInit {
  lowStockMedicines: Medicine[] = [];
  expiredMedicines: Medicine[] = [];

  constructor(private medicineService: MedicineService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.medicineService.getLowStockMedicines().subscribe(medicines => {
      this.lowStockMedicines = medicines;
    });

    this.medicineService.getExpiredMedicines().subscribe(medicines => {
      this.expiredMedicines = medicines;
    });
  }
}

