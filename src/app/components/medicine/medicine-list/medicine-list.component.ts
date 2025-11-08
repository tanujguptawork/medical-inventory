import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MedicineService } from '../../../services/medicine.service';
import { Medicine } from '../../../models/medicine.model';
import { MedicineFormComponent } from '../medicine-form/medicine-form.component';

@Component({
  selector: 'app-medicine-list',
  templateUrl: './medicine-list.component.html',
  styleUrls: ['./medicine-list.component.scss']
})
export class MedicineListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'batchNumber', 'manufacturer', 'category', 'quantity', 'price', 'expiryDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<Medicine>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private medicineService: MedicineService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMedicines();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadMedicines(): void {
    this.medicineService.getAllMedicines().subscribe(medicines => {
      this.dataSource.data = medicines;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(MedicineFormComponent, {
      width: '600px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMedicines();
      }
    });
  }

  openEditDialog(medicine: Medicine): void {
    const dialogRef = this.dialog.open(MedicineFormComponent, {
      width: '600px',
      data: medicine
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMedicines();
      }
    });
  }

  deleteMedicine(medicine: Medicine): void {
    if (confirm(`Are you sure you want to delete ${medicine.name}?`)) {
      if (medicine.id) {
        this.medicineService.deleteMedicine(medicine.id).subscribe({
          next: () => {
            this.snackBar.open('Medicine deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadMedicines();
          },
          error: () => {
            this.snackBar.open('Error deleting medicine', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'available':
        return 'primary';
      case 'low-stock':
        return 'accent';
      case 'out-of-stock':
        return 'warn';
      case 'expired':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getStatusText(status: string): string {
    return status.replace('-', ' ').toUpperCase();
  }
}

