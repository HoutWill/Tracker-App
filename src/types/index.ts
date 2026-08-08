export type CurrencyCode = 'USD' | 'KHR';

export type PaymentMethod = 'Cash' | 'Bank';

export type TransactionType = 'EXPENSE' | 'SAVING' | 'INCOME';

export type BudgetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';

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

export type ReminderCategory = 'BILLS' | 'SAVINGS' | 'TASK' | 'STUDY' | 'MEETING' | 'FUN' | 'SPORT' | 'WORK' | 'HEALTH';

export interface ReminderItem {
  id: string;
  title: string;
  notes?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  endTime?: string; // HH:mm
  category: ReminderCategory;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  level: 'URGENT' | 'FLAGGED' | 'SIMPLE';
  completed: boolean;
  alertEnabled?: boolean;
  periodScope?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  createdAt: number;
}

export interface PlannerPreset {
  id: string;
  title: string;
  category: ReminderCategory;
  level: 'URGENT' | 'FLAGGED' | 'SIMPLE';
  icon: string;
  color?: string;
}

export interface CycleSnapshot {
  id: string;
  type: 'BUDGET' | 'SAVING';
  period: BudgetPeriod;
  periodKey: string; // e.g. "2026-08-08" or "2026-W32" or "2026-08"
  targetAmount: number;
  actualAmount: number;
  status: 'COMPLETED' | 'SURPLUS' | 'OVERRUN';
  surplusAmount: number;
  archivedAt: number;
}


