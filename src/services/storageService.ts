import { ExpenseItem, CurrencyCode, QuickPreset, TripFolder } from '../types';

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
    paymentMethod: 'Cash',
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'exp-demo-3',
    title: 'Flight Ticket',
    amount: 120,
    currency: 'USD',
    type: 'EXPENSE',
    categoryId: 'cat-travel',
    categoryName: 'Travel',
    categoryIcon: 'plane',
    categoryColor: '#2EAADC',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank',
    createdAt: Date.now() - 1800000,
    tripId: 'trip-travel-demo',
  },
  {
    id: 'exp-demo-4',
    title: 'Team Lunch',
    amount: 45,
    currency: 'USD',
    type: 'EXPENSE',
    categoryId: 'cat-team',
    categoryName: 'Team',
    categoryIcon: 'users',
    categoryColor: '#A855F7',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    createdAt: Date.now() - 900000,
    tripId: 'trip-team-demo',
  },
];

export const StorageService = {
  getCachedExpenses(): ExpenseItem[] {
    const guestId = getGuestId();
    try {
      const local = localStorage.getItem(`expenses_${guestId}`) || localStorage.getItem('expenses');
      if (local) {
        return JSON.parse(local);
      }
      localStorage.setItem(`expenses_${guestId}`, JSON.stringify(DEFAULT_DEMO_EXPENSES));
      return DEFAULT_DEMO_EXPENSES;
    } catch (e) {
      return DEFAULT_DEMO_EXPENSES;
    }
  },

  async getExpenses(): Promise<ExpenseItem[]> {
    const guestId = getGuestId();
    try {
      const res = await fetch('/api/expenses', {
        headers: { 'x-guest-id': guestId },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data: ExpenseItem[] = await res.json();
        try {
          localStorage.setItem(`expenses_${guestId}`, JSON.stringify(data));
        } catch (e) {}
        return data;
      }
    } catch (e) {
      console.warn('API unavailable, reading local fallback');
    }

    return this.getCachedExpenses();
  },

  async addExpense(item: ExpenseItem | Omit<ExpenseItem, 'id' | 'createdAt'>): Promise<ExpenseItem> {
    const guestId = getGuestId();
    const newItem: ExpenseItem = {
      ...item,
      id: ('id' in item && item.id) ? item.id : 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: ('createdAt' in item && item.createdAt) ? item.createdAt : Date.now(),
    };

    // 1. Immediately update local cache synchronously
    try {
      const current = this.getCachedExpenses();
      const updated = [newItem, ...current.filter(e => e.id !== newItem.id)];
      localStorage.setItem(`expenses_${guestId}`, JSON.stringify(updated));
    } catch (e) {}

    // 2. Sync to API in background without blocking UI or fetching full list again
    fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-guest-id': guestId,
      },
      body: JSON.stringify(newItem),
    }).catch(e => {
      console.warn('API sync warn, kept locally:', e);
    });

    return newItem;
  },

  async updateExpense(id: string, updatedFields: Partial<ExpenseItem>): Promise<void> {
    const guestId = getGuestId();

    // 1. Update local cache synchronously
    try {
      const current = this.getCachedExpenses();
      const updated = current.map(e => (e.id === id ? { ...e, ...updatedFields } : e));
      localStorage.setItem(`expenses_${guestId}`, JSON.stringify(updated));
    } catch (e) {}

    // 2. Sync PUT in background
    fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-guest-id': guestId,
      },
      body: JSON.stringify(updatedFields),
    }).catch(e => {});
  },

  async deleteExpense(id: string): Promise<void> {
    const guestId = getGuestId();

    // 1. Update local cache synchronously
    try {
      const current = this.getCachedExpenses();
      const updated = current.filter(e => e.id !== id);
      localStorage.setItem(`expenses_${guestId}`, JSON.stringify(updated));
    } catch (e) {}

    // 2. Sync DELETE in background
    fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
      headers: { 'x-guest-id': guestId },
    }).catch(e => {});
  },

  async clearAll(): Promise<void> {
    const guestId = getGuestId();
    try {
      localStorage.removeItem(`expenses_${guestId}`);
      localStorage.removeItem('expenses');
    } catch (e) {}

    fetch('/api/expenses/reset', {
      method: 'POST',
      headers: { 'x-guest-id': guestId },
    }).catch(e => {});
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

  getTrips(): TripFolder[] {
    const guestId = getGuestId();
    const defaultDemoTrips: TripFolder[] = [
      {
        id: 'trip-travel-demo',
        name: 'Travel',
        category: 'Travel',
        budget: 350,
        currency: 'USD',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        createdAt: Date.now(),
        status: 'Active',
        type: 'EXPENSE',
      },
      {
        id: 'trip-team-demo',
        name: 'Team',
        category: 'Team',
        budget: 200,
        currency: 'USD',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
        createdAt: Date.now() - 1000,
        status: 'Active',
        type: 'EXPENSE',
      },
      {
        id: 'trip-vault-demo',
        name: 'Vault',
        category: 'Vault',
        budget: 500,
        currency: 'USD',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        createdAt: Date.now() - 2000,
        status: 'Active',
        type: 'SAVING',
      },
      {
        id: 'trip-emergency-demo',
        name: 'Emergency',
        category: 'Emergency',
        budget: 1000,
        currency: 'USD',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        createdAt: Date.now() - 3000,
        status: 'Active',
        type: 'SAVING',
      },
    ];
    try {
      const local = localStorage.getItem(`trip_folders_${guestId}`);
      if (!local) return defaultDemoTrips;
      return JSON.parse(local);
    } catch (e) {
      return defaultDemoTrips;
    }
  },

  saveTrips(trips: TripFolder[]): void {
    const guestId = getGuestId();
    try {
      localStorage.setItem(`trip_folders_${guestId}`, JSON.stringify(trips));
    } catch (e) {}
  },
};
