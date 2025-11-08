import { Component, OnInit } from '@angular/core';
import { MedicineService } from '../../../services/medicine.service';
import { Medicine } from '../../../models/medicine.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-medicine-search',
  templateUrl: './medicine-search.component.html',
  styleUrls: ['./medicine-search.component.scss']
})
export class MedicineSearchComponent implements OnInit {
  searchQuery = '';
  searchResults: Medicine[] = [];
  isSearching = false;
  hasSearched = false;

  constructor(
    private medicineService: MedicineService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Load all medicines initially
    this.loadAllMedicines();
  }

  loadAllMedicines(): void {
    this.medicineService.getAllMedicines().subscribe(medicines => {
      this.searchResults = medicines;
      this.hasSearched = true;
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.loadAllMedicines();
      return;
    }

    this.isSearching = true;
    this.medicineService.searchMedicines(this.searchQuery).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.hasSearched = true;
        this.isSearching = false;
        
        if (results.length === 0) {
          this.snackBar.open('No medicines found matching your search', 'Close', {
            duration: 3000
          });
        }
      },
      error: () => {
        this.isSearching = false;
        this.snackBar.open('Error searching medicines', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onClearSearch(): void {
    this.searchQuery = '';
    this.loadAllMedicines();
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
}

