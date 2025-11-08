export interface Medicine {
  id?: string;
  name: string;
  batchNumber: string;
  manufacturer: string;
  expiryDate: Date | string;
  quantity: number;
  price: number;
  category: string;
  description?: string;
  location?: string;
  supplier?: string;
  purchaseDate?: Date | string;
  status: 'available' | 'low-stock' | 'out-of-stock' | 'expired';
}

export interface MedicineCategory {
  value: string;
  viewValue: string;
}

export const MEDICINE_CATEGORIES: MedicineCategory[] = [
  { value: 'antibiotic', viewValue: 'Antibiotic' },
  { value: 'analgesic', viewValue: 'Analgesic' },
  { value: 'antiviral', viewValue: 'Antiviral' },
  { value: 'antifungal', viewValue: 'Antifungal' },
  { value: 'vitamin', viewValue: 'Vitamin' },
  { value: 'supplement', viewValue: 'Supplement' },
  { value: 'cardiac', viewValue: 'Cardiac' },
  { value: 'diabetic', viewValue: 'Diabetic' },
  { value: 'respiratory', viewValue: 'Respiratory' },
  { value: 'other', viewValue: 'Other' }
];

