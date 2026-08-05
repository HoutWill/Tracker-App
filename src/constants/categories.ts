import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food & Dining', icon: '🍔', color: 'orange', budgetMonthly: 400 },
  { id: 'cat-coffee', name: 'Coffee & Snacks', icon: '☕', color: 'brown', budgetMonthly: 80 },
  { id: 'cat-groceries', name: 'Groceries', icon: '🛒', color: 'green', budgetMonthly: 300 },
  { id: 'cat-transport', name: 'Transport & Fuel', icon: '🚗', color: 'blue', budgetMonthly: 150 },
  { id: 'cat-bills', name: 'Bills & Utilities', icon: '⚡', color: 'red', budgetMonthly: 250 },
  { id: 'cat-shopping', name: 'Shopping', icon: '🛍️', color: 'pink', budgetMonthly: 200 },
  { id: 'cat-entertainment', name: 'Entertainment', icon: '🎬', color: 'purple', budgetMonthly: 120 },
  { id: 'cat-tech', name: 'Tech & Subscriptions', icon: '💻', color: 'yellow', budgetMonthly: 100 },
  { id: 'cat-health', name: 'Health & Fitness', icon: '🏋️', color: 'green', budgetMonthly: 100 },
  { id: 'cat-income', name: 'Salary / Income', icon: '💰', color: 'green', budgetMonthly: 0 },
];
