import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MedicineService } from '../../../services/medicine.service';
import { Medicine, MEDICINE_CATEGORIES } from '../../../models/medicine.model';

@Component({
  selector: 'app-medicine-form',
  templateUrl: './medicine-form.component.html',
  styleUrls: ['./medicine-form.component.scss']
})
export class MedicineFormComponent implements OnInit {
  medicineForm: FormGroup;
  isEditMode = false;
  categories = MEDICINE_CATEGORIES;

  constructor(
  private readonly fb: FormBuilder,
  private readonly medicineService: MedicineService,
  private readonly dialogRef: MatDialogRef<MedicineFormComponent>,
  private readonly snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Medicine | null
  ) {
    this.isEditMode = !!data;
    this.medicineForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data) {
      this.medicineForm.patchValue({
        ...this.data,
        expiryDate: this.data.expiryDate ? new Date(this.data.expiryDate) : null,
        purchaseDate: this.data.purchaseDate ? new Date(this.data.purchaseDate) : null
      });
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      batchNumber: ['', [Validators.required]],
      manufacturer: ['', [Validators.required]],
      expiryDate: ['', [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      description: [''],
      location: [''],
      supplier: [''],
      purchaseDate: ['']
    });
  }

  onSubmit(): void {
    if (this.medicineForm.valid) {
      const formValue = this.medicineForm.value;
      const medicine: Medicine = {
        ...formValue,
        expiryDate: formValue.expiryDate,
        purchaseDate: formValue.purchaseDate || undefined
      };

      if (this.isEditMode && this.data?.id) {
        this.medicineService.updateMedicine(this.data.id, medicine).subscribe({
          next: () => {
            this.snackBar.open('Medicine updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.dialogRef.close(true);
          },
          error: () => {
            this.snackBar.open('Error updating medicine', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      } else {
        this.medicineService.addMedicine(medicine).subscribe({
          next: () => {
            this.snackBar.open('Medicine added successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.dialogRef.close(true);
          },
          error: () => {
            this.snackBar.open('Error adding medicine', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.medicineForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field?.hasError('min')) {
      return `${fieldName} must be greater than or equal to 0`;
    }
    if (field?.hasError('minlength')) {
      return `${fieldName} must be at least 2 characters`;
    }
    return '';
  }
}

