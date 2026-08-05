import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExpenseItem, CurrencyCode } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/categories';

const STORAGE_KEYS = {
  EXPENSES: '@notion_expenses_v1',
  GEMINI_KEY: '@gemini_api_key_v1',
  DEEPSEEK_KEY: '@deepseek_api_key_v1',
  CURRENCY: '@active_currency_v1',
  THEME: '@active_theme_v1',
  CUSTOM_PRESETS: '@custom_presets_v1',
};

// Fixed conversion rate for USD <-> KHR (1 USD = 4,000 KHR)
export const KHR_PER_USD = 4000;

export const convertCurrency = (amount: number, from: CurrencyCode, to: CurrencyCode): number => {
  if (from === to) return amount;
  if (from === 'USD' && to === 'KHR') return Math.round(amount * KHR_PER_USD);
  if (from === 'KHR' && to === 'USD') return Number((amount / KHR_PER_USD).toFixed(2));
  return amount;
};

export const formatCurrency = (amountUSD: number, currency: CurrencyCode): string => {
  if (currency === 'KHR') {
    const khrVal = Math.round(amountUSD * KHR_PER_USD);
    return `${khrVal.toLocaleString()} ៛`;
  }
  return `$${amountUSD.toFixed(2)}`;
};

export const generateSampleExpenses = (): ExpenseItem[] => {
  const today = new Date();
  const formatDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'exp-1',
      title: 'Morning Latte & Croissant',
      amount: 4.5,
      currency: 'USD',
      categoryId: 'cat-coffee',
      categoryName: 'Coffee & Snacks',
      categoryIcon: '☕',
      categoryColor: 'brown',
      date: formatDate(0),
      paymentMethod: 'Credit Card',
      notes: 'Notion cafe morning work session',
      createdAt: Date.now() - 3600000 * 2,
    },
    {
      id: 'exp-2',
      title: 'Trader Joe Groceries',
      amount: 48.2,
      currency: 'USD',
      categoryId: 'cat-groceries',
      categoryName: 'Groceries',
      categoryIcon: '🛒',
      categoryColor: 'green',
      date: formatDate(0),
      paymentMethod: 'Mobile Pay',
      notes: 'Weekly fresh produce & snacks',
      createdAt: Date.now() - 3600000 * 6,
    },
    {
      id: 'exp-3',
      title: 'Street Noodle Soup (៛)',
      amount: 2.5, // $2.50 = 10,000 Riel
      currency: 'KHR',
      amountOriginal: 10000,
      categoryId: 'cat-food',
      categoryName: 'Food & Dining',
      categoryIcon: '🍔',
      categoryColor: 'orange',
      date: formatDate(1),
      paymentMethod: 'Cash',
      notes: 'Paid 10,000 Cambodian Riel in cash',
      createdAt: Date.now() - 86400000 * 1,
    },
    {
      id: 'exp-4',
      title: 'Uber Ride to Downtown',
      amount: 14.5,
      currency: 'USD',
      categoryId: 'cat-transport',
      categoryName: 'Transport & Fuel',
      categoryIcon: '🚗',
      categoryColor: 'blue',
      date: formatDate(2),
      paymentMethod: 'Credit Card',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'exp-5',
      title: 'Monthly Internet & WiFi',
      amount: 35.0,
      currency: 'USD',
      categoryId: 'cat-bills',
      categoryName: 'Bills & Utilities',
      categoryIcon: '⚡',
      categoryColor: 'red',
      date: formatDate(4),
      paymentMethod: 'Bank Transfer',
      notes: 'Fiber optics monthly bill',
      createdAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'exp-6',
      title: 'ChatGPT & Figma Subscription',
      amount: 20.0,
      currency: 'USD',
      categoryId: 'cat-tech',
      categoryName: 'Tech & Subscriptions',
      categoryIcon: '💻',
      categoryColor: 'yellow',
      date: formatDate(6),
      paymentMethod: 'Credit Card',
      createdAt: Date.now() - 86400000 * 6,
    },
  ];
};

export const StorageService = {
  async getExpenses(): Promise<ExpenseItem[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!json) {
        const samples = generateSampleExpenses();
        await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(samples));
        return samples;
      }
      return JSON.parse(json);
    } catch (e) {
      console.error('Error reading expenses from storage:', e);
      return [];
    }
  },

  async saveExpenses(expenses: ExpenseItem[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      return true;
    } catch (e) {
      console.error('Error saving expenses to storage:', e);
      return false;
    }
  },

  async getGeminiApiKey(): Promise<string> {
    try {
      return (await AsyncStorage.getItem(STORAGE_KEYS.GEMINI_KEY)) || '';
    } catch (e) {
      return '';
    }
  },

  async saveGeminiApiKey(key: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key.trim());
      return true;
    } catch (e) {
      return false;
    }
  },

  async getDeepSeekApiKey(): Promise<string> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.DEEPSEEK_KEY);
      return val ? val.trim() : 'sk-e31a4ca80e5947408ce901fc8070837a';
    } catch (e) {
      return 'sk-e31a4ca80e5947408ce901fc8070837a';
    }
  },

  async saveDeepSeekApiKey(key: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DEEPSEEK_KEY, key.trim());
      return true;
    } catch (e) {
      return false;
    }
  },

  async getCurrency(): Promise<CurrencyCode> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.CURRENCY);
      return (val as CurrencyCode) || 'USD';
    } catch (e) {
      return 'USD';
    }
  },

  async saveCurrency(currency: CurrencyCode): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
      return true;
    } catch (e) {
      return false;
    }
  },

  async getTheme(): Promise<'dark' | 'light'> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      return (val as 'dark' | 'light') || 'dark';
    } catch (e) {
      return 'dark';
    }
  },

  async saveTheme(theme: 'dark' | 'light'): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
      return true;
    } catch (e) {
      return false;
    }
  },

  async exportBackup(): Promise<string> {
    const expenses = await this.getExpenses();
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      expenses,
    }, null, 2);
  },

  async importBackup(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.expenses)) {
        await this.saveExpenses(parsed.expenses);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  }
};
