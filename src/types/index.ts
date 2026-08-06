export type CurrencyCode = 'USD' | 'KHR';

export type PaymentMethod = 'Cash' | 'Bank';

export type TransactionType = 'EXPENSE' | 'SAVING' | 'INCOME';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budgetMonthly: number;
  type?: TransactionType;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  amountOriginal?: number;
  type?: TransactionType;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
  tripId?: string;
}

export interface QuickPreset {
  id: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  categoryId: string;
  icon: string;
  type?: TransactionType;
}

export interface TripFolder {
  id: string;
  name: string;
  category: string;
  budget: number;
  currency: CurrencyCode;
  startDate: string;
  endDate: string;
  createdAt: number;
  status: 'Active' | 'Closed';
  type?: TransactionType;
}

export interface ReminderItem {
  id: string;
  title: string;
  notes?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  category: 'BILLS' | 'SAVINGS' | 'TASK';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  level: 'URGENT' | 'SIMPLE';
  completed: boolean;
  alertEnabled: boolean;
  createdAt: number;
}
