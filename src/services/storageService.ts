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
  try {
    let gid = localStorage.getItem('guest_device_id');
    if (!gid) {
      gid = 'guest_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
      localStorage.setItem('guest_device_id', gid);
    }
    return gid;
  } catch (e) {
    return 'guest_default';
  }
};

const DEFAULT_DEMO_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-demo-1',
    title: 'Emergency Vault Deposit',
    amount: 50,
    currency: 'USD',
    type: 'SAVING',
    categoryId: 'cat-saving-vault',
    categoryName: 'Vault',
    categoryIcon: 'piggy-bank',
    categoryColor: '#00E676',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'exp-demo-2',
    title: 'Iced Coffee',
    amount: 3.5,
    currency: 'USD',
    type: 'EXPENSE',
    categoryId: 'cat-coffee',
    categoryName: 'Coffee',
    categoryIcon: 'cafe-outline',
    categoryColor: '#6C5CE7',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Card',
    createdAt: Date.now() - 7200000,
  },
];

export const StorageService = {
  async getExpenses(): Promise<ExpenseItem[]> {
    const guestId = getGuestId();
    try {
      const res = await fetch('/api/expenses', {
        headers: { 'x-guest-id': guestId },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API unavailable, reading local fallback');
    }

    try {
      const local = localStorage.getItem(`expenses_${guestId}`) || localStorage.getItem('expenses');
      if (local) {
        return JSON.parse(local);
      }
      // Save initial demo items for new visitors
      localStorage.setItem(`expenses_${guestId}`, JSON.stringify(DEFAULT_DEMO_EXPENSES));
      return DEFAULT_DEMO_EXPENSES;
    } catch (e) {
      return DEFAULT_DEMO_EXPENSES;
    }
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
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API error, saving locally');
    }

    const current = await this.getExpenses();
    const updated = [newItem, ...current];
    try {
      localStorage.setItem(`expenses_${guestId}`, JSON.stringify(updated));
    } catch (e) {}
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
    try {
      localStorage.setItem(`expenses_${guestId}`, JSON.stringify(updated));
    } catch (e) {}
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
    try {
      localStorage.setItem(`expenses_${guestId}`, JSON.stringify(updated));
    } catch (e) {}
  },

  async clearAll(): Promise<void> {
    const guestId = getGuestId();
    try {
      await fetch('/api/expenses/reset', {
        method: 'POST',
        headers: { 'x-guest-id': guestId },
      });
    } catch (e) {}
    try {
      localStorage.removeItem(`expenses_${guestId}`);
      localStorage.removeItem('expenses');
    } catch (e) {}
  },

  getCustomPresetAmounts(): Record<string, number> {
    const guestId = getGuestId();
    try {
      const local = localStorage.getItem(`preset_custom_amounts_${guestId}`) || localStorage.getItem('preset_custom_amounts');
      return local ? JSON.parse(local) : {};
    } catch (e) {
      return {};
    }
  },

  saveCustomPresetAmount(presetId: string, amount: number): void {
    const guestId = getGuestId();
    const current = this.getCustomPresetAmounts();
    current[presetId] = amount;
    try {
      localStorage.setItem(`preset_custom_amounts_${guestId}`, JSON.stringify(current));
    } catch (e) {}
  },

  getPresetsList(type: 'EXPENSE' | 'SAVING', defaultList: QuickPreset[]): QuickPreset[] {
    const guestId = getGuestId();
    const key = type === 'EXPENSE' ? `expense_presets_custom_${guestId}` : `saving_presets_custom_${guestId}`;
    try {
      const local = localStorage.getItem(key) || localStorage.getItem(type === 'EXPENSE' ? 'expense_presets_custom' : 'saving_presets_custom');
      if (!local) return defaultList;
      return JSON.parse(local);
    } catch (e) {
      return defaultList;
    }
  },

  savePresetsList(type: 'EXPENSE' | 'SAVING', list: QuickPreset[]): void {
    const guestId = getGuestId();
    const key = type === 'EXPENSE' ? `expense_presets_custom_${guestId}` : `saving_presets_custom_${guestId}`;
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {}
  },
};
