import { QuickPreset } from '../types';

export const EXPENSE_QUICK_PRESETS: QuickPreset[] = [
  { id: 'preset-drink', title: 'Drink', amount: 3.5, currency: 'USD', categoryId: 'cat-drink', icon: 'coffee', type: 'EXPENSE' },
  { id: 'preset-food', title: 'Food', amount: 8.0, currency: 'USD', categoryId: 'cat-food', icon: 'utensils', type: 'EXPENSE' },
  { id: 'preset-transport', title: 'Transport', amount: 5.0, currency: 'USD', categoryId: 'cat-transport', icon: 'car', type: 'EXPENSE' },
  { id: 'preset-investment', title: 'Investment', amount: 50.0, currency: 'USD', categoryId: 'cat-investment', icon: 'trending-up', type: 'EXPENSE' },
  { id: 'preset-groceries', title: 'Groceries', amount: 35.0, currency: 'USD', categoryId: 'cat-groceries', icon: 'shopping-cart', type: 'EXPENSE' },
  { id: 'preset-shopping', title: 'Shopping', amount: 15.0, currency: 'USD', categoryId: 'cat-shopping', icon: 'bag-handle', type: 'EXPENSE' },
  { id: 'preset-bills', title: 'Bills', amount: 45.0, currency: 'USD', categoryId: 'cat-bills', icon: 'receipt', type: 'EXPENSE' },
  { id: 'preset-tech', title: 'Tech', amount: 20.0, currency: 'USD', categoryId: 'cat-tech', icon: 'laptop', type: 'EXPENSE' },
  { id: 'preset-fun', title: 'Fun', amount: 12.0, currency: 'USD', categoryId: 'cat-fun', icon: 'film', type: 'EXPENSE' },
  { id: 'preset-travel', title: 'Travel', amount: 45.0, currency: 'USD', categoryId: 'cat-travel', icon: 'plane', type: 'EXPENSE' },
  { id: 'preset-team', title: 'Team', amount: 25.0, currency: 'USD', categoryId: 'cat-team', icon: 'users', type: 'EXPENSE' },
  { id: 'preset-party', title: 'Party', amount: 30.0, currency: 'USD', categoryId: 'cat-party', icon: 'party-popper', type: 'EXPENSE' },
];

export const SAVING_QUICK_PRESETS: QuickPreset[] = [
  { id: 'preset-saving-income', title: 'Income', amount: 500.0, currency: 'USD', categoryId: 'cat-saving-vault', icon: 'wallet', type: 'SAVING' },
  { id: 'preset-saving-vault', title: 'Vault', amount: 100.0, currency: 'USD', categoryId: 'cat-saving-vault', icon: 'piggy-bank', type: 'SAVING' },
  { id: 'preset-saving-emergency', title: 'Emergency', amount: 200.0, currency: 'USD', categoryId: 'cat-saving-emergency', icon: 'shield-checkmark', type: 'SAVING' },
  { id: 'preset-saving-goal', title: 'Goal', amount: 50.0, currency: 'USD', categoryId: 'cat-saving-goal', icon: 'target', type: 'SAVING' },
  { id: 'preset-saving-gold', title: 'Gold', amount: 300.0, currency: 'USD', categoryId: 'cat-saving-vault', icon: 'sparkles', type: 'SAVING' },
  { id: 'preset-saving-stocks', title: 'Stocks', amount: 150.0, currency: 'USD', categoryId: 'cat-saving-vault', icon: 'trending-up', type: 'SAVING' },
  { id: 'preset-saving-crypto', title: 'Crypto', amount: 50.0, currency: 'USD', categoryId: 'cat-saving-vault', icon: 'flash', type: 'SAVING' },
  { id: 'preset-saving-bond', title: 'Bond', amount: 100.0, currency: 'USD', categoryId: 'cat-saving-vault', icon: 'briefcase', type: 'SAVING' },
  { id: 'preset-saving-reserve', title: 'Reserve', amount: 500.0, currency: 'USD', categoryId: 'cat-saving-vault', icon: 'lock-closed', type: 'SAVING' },
];

export const QUICK_PRESETS = [...EXPENSE_QUICK_PRESETS, ...SAVING_QUICK_PRESETS];
