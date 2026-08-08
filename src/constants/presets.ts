import { QuickPreset, PlannerPreset } from '../types';

export const EXPENSE_QUICK_PRESETS: QuickPreset[] = [
  { id: 'preset-food', title: 'Food', amount: 1.0, currency: 'USD', categoryId: 'cat-food', icon: 'utensils', type: 'EXPENSE' },
  { id: 'preset-drink', title: 'Drink', amount: 1.0, currency: 'USD', categoryId: 'cat-drink', icon: 'coffee', type: 'EXPENSE' },
  { id: 'preset-transport', title: 'Transport', amount: 1.0, currency: 'USD', categoryId: 'cat-transport', icon: 'car', type: 'EXPENSE' },
  { id: 'preset-bills', title: 'Bills', amount: 1.0, currency: 'USD', categoryId: 'cat-bills', icon: 'receipt', type: 'EXPENSE' },
  { id: 'preset-shopping', title: 'Shopping', amount: 1.0, currency: 'USD', categoryId: 'cat-shopping', icon: 'bag-handle', type: 'EXPENSE' },
];

export const SAVING_QUICK_PRESETS: QuickPreset[] = [
  { id: 'preset-saving-vault', title: 'Vault', amount: 1.0, currency: 'USD', categoryId: 'cat-saving-vault', icon: 'piggy-bank', type: 'SAVING' },
  { id: 'preset-saving-emergency', title: 'Emergency', amount: 1.0, currency: 'USD', categoryId: 'cat-saving-emergency', icon: 'shield-checkmark', type: 'SAVING' },
  { id: 'preset-saving-goal', title: 'Goal', amount: 1.0, currency: 'USD', categoryId: 'cat-saving-goal', icon: 'target', type: 'SAVING' },
  { id: 'preset-saving-income', title: 'Income', amount: 1.0, currency: 'USD', categoryId: 'cat-saving-vault', icon: 'wallet', type: 'SAVING' },
  { id: 'preset-saving-investment', title: 'Investment', amount: 1.0, currency: 'USD', categoryId: 'cat-saving-vault', icon: 'trending-up', type: 'SAVING' },
];

export const PLANNER_QUICK_PRESETS: PlannerPreset[] = [
  { id: 'p-1', title: 'Gym', category: 'SPORT', level: 'FLAGGED', icon: 'dumbbell', color: '#EC668C' },
  { id: 'p-2', title: 'Bills', category: 'BILLS', level: 'URGENT', icon: 'receipt', color: '#F3A85B' },
  { id: 'p-3', title: 'Meeting', category: 'MEETING', level: 'FLAGGED', icon: 'users', color: '#4A99E9' },
  { id: 'p-4', title: 'Study', category: 'STUDY', level: 'SIMPLE', icon: 'book-open', color: '#6C5CE7' },
  { id: 'p-5', title: 'Doctor', category: 'HEALTH', level: 'URGENT', icon: 'heart', color: '#30D158' },
];

export const QUICK_PRESETS = [...EXPENSE_QUICK_PRESETS, ...SAVING_QUICK_PRESETS];

