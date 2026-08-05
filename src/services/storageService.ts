import { ExpenseItem, CurrencyCode, QuickPreset } from '../types';

export const KHR_PER_USD = 4000;

export const formatCurrency = (amountUSD: number, currency: CurrencyCode): string => {
  if (currency === 'KHR') {
    const khrVal = Math.round(amountUSD * KHR_PER_USD);
    return `${khrVal.toLocaleString()} ៛`;
  }
  return `$${amountUSD.toFixed(2)}`;
};

export const StorageService = {
  async getExpenses(): Promise<ExpenseItem[]> {
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API unavailable, reading local fallback');
    }
    const local = localStorage.getItem('expenses');
    return local ? JSON.parse(local) : [];
  },

  async addExpense(item: Omit<ExpenseItem, 'id' | 'createdAt'>): Promise<ExpenseItem> {
    const newItem: ExpenseItem = {
      ...item,
      id: 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: Date.now(),
    };

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API error, saving locally');
    }

    const current = await this.getExpenses();
    const updated = [newItem, ...current];
    localStorage.setItem('expenses', JSON.stringify(updated));
    return newItem;
  },

  async updateExpense(id: string, updatedFields: Partial<ExpenseItem>): Promise<void> {
    try {
      await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
    } catch (e) {}

    const current = await this.getExpenses();
    const updated = current.map(e => (e.id === id ? { ...e, ...updatedFields } : e));
    localStorage.setItem('expenses', JSON.stringify(updated));
  },

  async deleteExpense(id: string): Promise<void> {
    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    } catch (e) {}

    const current = await this.getExpenses();
    const updated = current.filter(e => e.id !== id);
    localStorage.setItem('expenses', JSON.stringify(updated));
  },

  async clearAll(): Promise<void> {
    try {
      await fetch('/api/expenses/reset', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('expenses');
  },

  getCustomPresetAmounts(): Record<string, number> {
    const local = localStorage.getItem('preset_custom_amounts');
    return local ? JSON.parse(local) : {};
  },

  saveCustomPresetAmount(presetId: string, amount: number): void {
    const current = this.getCustomPresetAmounts();
    current[presetId] = amount;
    localStorage.setItem('preset_custom_amounts', JSON.stringify(current));
  },

  getPresetsList(type: 'EXPENSE' | 'SAVING', defaultList: QuickPreset[]): QuickPreset[] {
    const key = type === 'EXPENSE' ? 'expense_presets_custom' : 'saving_presets_custom';
    const local = localStorage.getItem(key);
    if (!local) return defaultList;
    try {
      return JSON.parse(local);
    } catch (e) {
      return defaultList;
    }
  },

  savePresetsList(type: 'EXPENSE' | 'SAVING', list: QuickPreset[]): void {
    const key = type === 'EXPENSE' ? 'expense_presets_custom' : 'saving_presets_custom';
    localStorage.setItem(key, JSON.stringify(list));
  },
};
