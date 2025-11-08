import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Medicine } from '../models/medicine.model';
import { AuditLogService } from './audit-log.service';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private medicinesSubject = new BehaviorSubject<Medicine[]>([]);
  public medicines$ = this.medicinesSubject.asObservable();
  private storageKey = 'medicines_data';

  constructor(private auditLogService: AuditLogService) {
    this.loadMedicinesFromStorage();
  }

  getAllMedicines(): Observable<Medicine[]> {
    return this.medicines$;
  }

  getMedicineById(id: string): Observable<Medicine | undefined> {
    const medicines = this.medicinesSubject.value;
    const medicine = medicines.find(m => m.id === id);
    return of(medicine);
  }

  addMedicine(medicine: Medicine): Observable<Medicine> {
    return new Observable(observer => {
      setTimeout(() => {
        const medicines = this.medicinesSubject.value;
        const newMedicine: Medicine = {
          ...medicine,
          id: this.generateId(),
          status: this.calculateStatus(medicine)
        };
        const updatedMedicines = [...medicines, newMedicine];
        this.medicinesSubject.next(updatedMedicines);
        this.saveMedicinesToStorage(updatedMedicines);
        
        // Log the action
        this.auditLogService.logAction(
          'create',
          'medicine',
          newMedicine.id!,
          newMedicine.name,
          undefined,
          `Added new medicine: ${newMedicine.name}`
        );
        
        observer.next(newMedicine);
        observer.complete();
      }, 300);
    });
  }

  updateMedicine(id: string, medicine: Medicine): Observable<Medicine> {
    return new Observable(observer => {
      setTimeout(() => {
        const medicines = this.medicinesSubject.value;
        const index = medicines.findIndex(m => m.id === id);
        if (index !== -1) {
          const oldMedicine = medicines[index];
          const updatedMedicine: Medicine = {
            ...medicine,
            id,
            status: this.calculateStatus(medicine)
          };
          
          // Track changes
          const changes = this.getChanges(oldMedicine, updatedMedicine);
          
          medicines[index] = updatedMedicine;
          this.medicinesSubject.next([...medicines]);
          this.saveMedicinesToStorage(medicines);
          
          // Log the action
          this.auditLogService.logAction(
            'update',
            'medicine',
            id,
            updatedMedicine.name,
            changes,
            `Updated medicine: ${updatedMedicine.name}`
          );
          
          observer.next(updatedMedicine);
        }
        observer.complete();
      }, 300);
    });
  }

  deleteMedicine(id: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const medicines = this.medicinesSubject.value;
        const medicineToDelete = medicines.find(m => m.id === id);
        const updatedMedicines = medicines.filter(m => m.id !== id);
        this.medicinesSubject.next(updatedMedicines);
        this.saveMedicinesToStorage(updatedMedicines);
        
        // Log the action
        if (medicineToDelete) {
          this.auditLogService.logAction(
            'delete',
            'medicine',
            id,
            medicineToDelete.name,
            undefined,
            `Deleted medicine: ${medicineToDelete.name}`
          );
        }
        
        observer.next(true);
        observer.complete();
      }, 300);
    });
  }

  private getChanges(oldMedicine: Medicine, newMedicine: Medicine): { field: string; oldValue: any; newValue: any }[] {
    const changes: { field: string; oldValue: any; newValue: any }[] = [];
    const fieldsToTrack: (keyof Medicine)[] = ['name', 'quantity', 'price', 'expiryDate', 'batchNumber', 'manufacturer', 'category'];
    
    fieldsToTrack.forEach(field => {
      if (oldMedicine[field] !== newMedicine[field]) {
        changes.push({
          field: field as string,
          oldValue: oldMedicine[field],
          newValue: newMedicine[field]
        });
      }
    });
    
    return changes;
  }

  searchMedicines(query: string): Observable<Medicine[]> {
    const medicines = this.medicinesSubject.value;
    const lowerQuery = query.toLowerCase();
    const filtered = medicines.filter(m =>
      m.name.toLowerCase().includes(lowerQuery) ||
      m.batchNumber.toLowerCase().includes(lowerQuery) ||
      m.manufacturer.toLowerCase().includes(lowerQuery) ||
      m.category.toLowerCase().includes(lowerQuery)
    );
    return of(filtered);
  }

  getLowStockMedicines(): Observable<Medicine[]> {
    const medicines = this.medicinesSubject.value;
    const lowStock = medicines.filter(m => m.quantity <= 10 && m.status !== 'out-of-stock');
    return of(lowStock);
  }

  getExpiredMedicines(): Observable<Medicine[]> {
    const medicines = this.medicinesSubject.value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expired = medicines.filter(m => {
      const expiryDate = new Date(m.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);
      return expiryDate < today;
    });
    return of(expired);
  }

  private calculateStatus(medicine: Medicine): Medicine['status'] {
    const expiryDate = new Date(medicine.expiryDate);
    const today = new Date();
    
    if (expiryDate < today) {
      return 'expired';
    }
    if (medicine.quantity === 0) {
      return 'out-of-stock';
    }
    if (medicine.quantity <= 10) {
      return 'low-stock';
    }
    return 'available';
  }

  private generateId(): string {
    return 'med_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private loadMedicinesFromStorage(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const medicines = JSON.parse(stored);
        // Update status for all medicines
        medicines.forEach((m: Medicine) => {
          m.status = this.calculateStatus(m);
        });
        this.medicinesSubject.next(medicines);
      } catch (e) {
        console.error('Error loading medicines from storage', e);
      }
    }
  }

  private saveMedicinesToStorage(medicines: Medicine[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(medicines));
  }
}

