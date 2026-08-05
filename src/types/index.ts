export type CurrencyCode = 'USD' | 'KHR';

export type PaymentMethod = 'Card' | 'Cash' | 'Bank' | 'Pay';

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
