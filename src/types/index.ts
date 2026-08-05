export type CurrencyCode = 'USD' | 'KHR';

export type PaymentMethod = 'Credit Card' | 'Cash' | 'Bank Transfer' | 'Mobile Pay';

export type NotionColor = 
  | 'red' 
  | 'blue' 
  | 'green' 
  | 'yellow' 
  | 'purple' 
  | 'pink' 
  | 'orange' 
  | 'gray' 
  | 'brown';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: NotionColor;
  budgetMonthly?: number;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number; // Stored in USD base amount
  currency: CurrencyCode;
  amountOriginal?: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: NotionColor;
  date: string; // ISO format YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  tags?: string[];
  createdAt: number;
}

export interface QuickPreset {
  id: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  categoryId: string;
  icon: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: number;
  actionTaken?: {
    type: 'ADD_EXPENSE' | 'FILTER_VIEW' | 'QUERY_RESULT';
    payload?: any;
  };
}

export type ActiveTab = 'home' | 'calendar' | 'analytics' | 'settings';
