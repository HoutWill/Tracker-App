import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // EXPENSE CATEGORIES (1-Word Only)
  { id: 'cat-food', name: 'Food', icon: 'utensils', color: 'orange', budgetMonthly: 400, type: 'EXPENSE' },
  { id: 'cat-drink', name: 'Drink', icon: 'coffee', color: 'brown', budgetMonthly: 80, type: 'EXPENSE' },
  { id: 'cat-transport', name: 'Transport', icon: 'car', color: 'blue', budgetMonthly: 150, type: 'EXPENSE' },
  { id: 'cat-investment', name: 'Investment', icon: 'trending-up', color: 'cyan', budgetMonthly: 300, type: 'EXPENSE' },
  { id: 'cat-groceries', name: 'Groceries', icon: 'shopping-cart', color: 'green', budgetMonthly: 300, type: 'EXPENSE' },
  { id: 'cat-bills', name: 'Bills', icon: 'zap', color: 'red', budgetMonthly: 250, type: 'EXPENSE' },
  { id: 'cat-shopping', name: 'Shopping', icon: 'shopping-bag', color: 'pink', budgetMonthly: 200, type: 'EXPENSE' },
  { id: 'cat-fun', name: 'Fun', icon: 'film', color: 'purple', budgetMonthly: 120, type: 'EXPENSE' },
  { id: 'cat-tech', name: 'Tech', icon: 'cpu', color: 'yellow', budgetMonthly: 100, type: 'EXPENSE' },
  { id: 'cat-health', name: 'Health', icon: 'activity', color: 'green', budgetMonthly: 100, type: 'EXPENSE' },

  // SAVINGS CATEGORIES (1-Word Only)
  { id: 'cat-saving-vault', name: 'Vault', icon: 'piggy-bank', color: 'green', budgetMonthly: 500, type: 'SAVING' },
  { id: 'cat-saving-emergency', name: 'Emergency', icon: 'piggy-bank', color: 'green', budgetMonthly: 300, type: 'SAVING' },
  { id: 'cat-saving-goal', name: 'Goal', icon: 'piggy-bank', color: 'green', budgetMonthly: 400, type: 'SAVING' },

  // INCOME CATEGORIES (1-Word Only)
  { id: 'cat-income', name: 'Income', icon: 'wallet', color: 'green', budgetMonthly: 0, type: 'INCOME' },
];
