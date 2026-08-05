import { ExpenseItem, CurrencyCode, QuickPreset } from '../types';

export const KHR_PER_USD = 4000;

export const formatCurrency = (amountUSD: number, currency: CurrencyCode): string => {
  if (currency === 'KHR') {
    const khrVal = Math.round(amountUSD * KHR_PER_USD);
    return `${khrVal.toLocaleString()} ៛`;
  }
  return `$${amountUSD.toFixed(2)}`;
};

export const getGuestId = (): string => {
  let gid = localStorage.getItem('guest_device_id');
  if (!gid) {
    gid = 'guest_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    localStorage.setItem('guest_device_id', gid);
  }
  return gid;
};

export const StorageService = {
  async getExpenses(): Promise<ExpenseItem[]> {
    const guestId = getGuestId();
    try {
      const res = await fetch('/api/expenses', {
        headers: { 'x-guest-id': guestId },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API unavailable, reading local fallback');
    }
    const local = localStorage.getItem(`expenses_${guestId}`) || localStorage.getItem('expenses');
    return local ? JSON.parse(local) : [];
  },

  async addExpense(item: Omit<ExpenseItem, 'id' | 'createdAt'>): Promise<ExpenseItem> {
    const guestId = getGuestId();
    const newItem: ExpenseItem = {
      ...item,
      id: 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: Date.now(),
    };

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-id': guestId,
        },
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
    localStorage.setItem(`expenses_${guestId}`, JSON.stringify(updated));
    return newItem;
  },

  async updateExpense(id: string, updatedFields: Partial<ExpenseItem>): Promise<void> {
    const guestId = getGuestId();
    try {
      await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-id': guestId,
        },
        body: JSON.stringify(updatedFields),
      });
    } catch (e) {}

    const current = await this.getExpenses();
    const updated = current.map(e => (e.id === id ? { ...e, ...updatedFields } : e));
    localStorage.setItem(`expenses_${guestId}`, JSON.stringify(updated));
  },

  async deleteExpense(id: string): Promise<void> {
    const guestId = getGuestId();
    try {
      await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'x-guest-id': guestId },
      });
    } catch (e) {}

    const current = await this.getExpenses();
    const updated = current.filter(e => e.id !== id);
    localStorage.setItem(`expenses_${guestId}`, JSON.stringify(updated));
  },

  async clearAll(): Promise<void> {
    const guestId = getGuestId();
    try {
      await fetch('/api/expenses/reset', {
        method: 'POST',
        headers: { 'x-guest-id': guestId },
      });
    } catch (e) {}
    localStorage.removeItem(`expenses_${guestId}`);
    localStorage.removeItem('expenses');
  },

  getCustomPresetAmounts(): Record<string, number> {
    const guestId = getGuestId();
    const local = localStorage.getItem(`preset_custom_amounts_${guestId}`) || localStorage.getItem('preset_custom_amounts');
    return local ? JSON.parse(local) : {};
  },

  saveCustomPresetAmount(presetId: string, amount: number): void {
    const guestId = getGuestId();
    const current = this.getCustomPresetAmounts();
    current[presetId] = amount;
    localStorage.setItem(`preset_custom_amounts_${guestId}`, JSON.stringify(current));
  },

  getPresetsList(type: 'EXPENSE' | 'SAVING', defaultList: QuickPreset[]): QuickPreset[] {
    const guestId = getGuestId();
    const key = type === 'EXPENSE' ? `expense_presets_custom_${guestId}` : `saving_presets_custom_${guestId}`;
    const local = localStorage.getItem(key) || localStorage.getItem(type === 'EXPENSE' ? 'expense_presets_custom' : 'saving_presets_custom');
    if (!local) return defaultList;
    try {
      return JSON.parse(local);
    } catch (e) {
      return defaultList;
    }
  },

  savePresetsList(type: 'EXPENSE' | 'SAVING', list: QuickPreset[]): void {
    const guestId = getGuestId();
    const key = type === 'EXPENSE' ? `expense_presets_custom_${guestId}` : `saving_presets_custom_${guestId}`;
    localStorage.setItem(key, JSON.stringify(list));
  },
};
