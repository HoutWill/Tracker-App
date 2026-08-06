import { ExpenseItem, CurrencyCode, QuickPreset, TripFolder, ReminderItem } from '../types';

export const KHR_PER_USD = 4000;

export const formatCurrency = (amountUSD: number, currency: CurrencyCode): string => {
  if (currency === 'KHR') {
    const khrVal = Math.round(amountUSD * KHR_PER_USD);
    return `${khrVal.toLocaleString()} ៛`;
  }
  return `$${amountUSD.toFixed(2)}`;
};

export const getTodayDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getGuestId = (): string => {
  try {
    const userAcc = localStorage.getItem('user_account');
    if (userAcc) {
      const parsed = JSON.parse(userAcc);
      if (parsed && parsed.accountId) {
        return parsed.accountId;
      }
    }
    let gid = localStorage.getItem('guest_device_id');
    if (!gid) {
      gid = 'usr_session_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('guest_device_id', gid);
    }
    return gid;
  } catch (e) {
    return 'usr_default';
  }
};

export const setGuestId = (newId: string): void => {
  try {
    localStorage.setItem('guest_device_id', newId.trim());
  } catch (e) {}
};

export const requestPersistentStorage = async (): Promise<boolean> => {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    return isPersisted;
  }
  return false;
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
      const masterKey = `pitrack_expenses_${guestId}`;
      const raw = localStorage.getItem(masterKey) || localStorage.getItem('pitrack_expenses_data');
      if (raw) {
        const parsed: ExpenseItem[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => b.createdAt - a.createdAt);
        }
      }

      // Check if user has initialized before
      const initialized = localStorage.getItem('pitrack_expenses_initialized');
      if (initialized) {
        return [];
      }

      localStorage.setItem('pitrack_expenses_initialized', 'true');
      localStorage.setItem(masterKey, JSON.stringify(DEFAULT_DEMO_EXPENSES));
      localStorage.setItem('pitrack_expenses_data', JSON.stringify(DEFAULT_DEMO_EXPENSES));
      return DEFAULT_DEMO_EXPENSES;
    } catch (e) {
      return DEFAULT_DEMO_EXPENSES;
    }
  },

  async getExpenses(): Promise<ExpenseItem[]> {
    const guestId = getGuestId();
    const cached = this.getCachedExpenses();

    // Fire non-blocking background fetch to sync server data without delaying UI
    fetch('/api/expenses', {
      headers: { 'x-guest-id': guestId },
    })
      .then(res => {
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          return res.json();
        }
        return null;
      })
      .then(serverData => {
        if (Array.isArray(serverData) && serverData.length > 0) {
          const mergedMap = new Map<string, ExpenseItem>();
          serverData.forEach(item => mergedMap.set(item.id, item));
          cached.forEach(item => mergedMap.set(item.id, item));
          const merged = Array.from(mergedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
          try {
            localStorage.setItem('pitrack_expenses_data', JSON.stringify(merged));
            localStorage.setItem(`pitrack_expenses_${guestId}`, JSON.stringify(merged));
          } catch (e) {}
        }
      })
      .catch(() => {});

    // Return instant local cached data immediately (0ms UI lag)
    return cached;
  },

  async addExpense(item: ExpenseItem | Omit<ExpenseItem, 'id' | 'createdAt'>): Promise<ExpenseItem> {
    const guestId = getGuestId();
    const newItem: ExpenseItem = {
      ...item,
      id: ('id' in item && item.id) ? item.id : 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: ('createdAt' in item && item.createdAt) ? item.createdAt : Date.now(),
    };

    // 1. Immediately update local master cache synchronously
    try {
      const current = this.getCachedExpenses();
      const updated = [newItem, ...current.filter(e => e.id !== newItem.id)];
      localStorage.setItem('pitrack_expenses_data', JSON.stringify(updated));
      localStorage.setItem(`pitrack_expenses_${guestId}`, JSON.stringify(updated));
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
      localStorage.setItem('pitrack_expenses_data', JSON.stringify(updated));
      localStorage.setItem(`pitrack_expenses_${guestId}`, JSON.stringify(updated));
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
      localStorage.setItem('pitrack_expenses_data', JSON.stringify(updated));
      localStorage.setItem(`pitrack_expenses_${guestId}`, JSON.stringify(updated));
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
      localStorage.setItem('pitrack_expenses_data', JSON.stringify([]));
      localStorage.setItem(`pitrack_expenses_${guestId}`, JSON.stringify([]));
      localStorage.setItem('pitrack_expenses_initialized', 'true');
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
      const local =
        localStorage.getItem('pitrack_trips_data') ||
        localStorage.getItem(`trip_folders_${guestId}`);
      if (!local) {
        localStorage.setItem('pitrack_trips_data', JSON.stringify(defaultDemoTrips));
        localStorage.setItem(`trip_folders_${guestId}`, JSON.stringify(defaultDemoTrips));
        return defaultDemoTrips;
      }
      return JSON.parse(local);
    } catch (e) {
      return defaultDemoTrips;
    }
  },

  saveTrips(trips: TripFolder[]): void {
    const guestId = getGuestId();
    try {
      localStorage.setItem('pitrack_trips_data', JSON.stringify(trips));
      localStorage.setItem(`trip_folders_${guestId}`, JSON.stringify(trips));
    } catch (e) {}
  },

  getReminders(): ReminderItem[] {
    const guestId = getGuestId();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const inTwoDays = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
    const inThreeDays = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

    const defaultDemoReminders: ReminderItem[] = [
      {
        id: 'rem-bills-1',
        title: 'Electricity',
        notes: 'Pay monthly power bill',
        dueDate: getTodayDateString(),
        dueTime: '18:00',
        category: 'BILLS',
        priority: 'HIGH',
        level: 'URGENT',
        completed: false,
        alertEnabled: true,
        createdAt: Date.now(),
      },
      {
        id: 'rem-meeting-1',
        title: 'Team Briefing',
        notes: 'Project sprint review',
        dueDate: getTodayDateString(),
        dueTime: '14:30',
        category: 'MEETING',
        priority: 'HIGH',
        level: 'URGENT',
        completed: false,
        alertEnabled: true,
        createdAt: Date.now() - 500,
      },
      {
        id: 'rem-study-1',
        title: 'Algorithm Study',
        notes: 'Chapter 4 data structures',
        dueDate: getTodayDateString(),
        dueTime: '20:00',
        category: 'STUDY',
        priority: 'MEDIUM',
        level: 'SIMPLE',
        completed: false,
        alertEnabled: false,
        createdAt: Date.now() - 1000,
      },
      {
        id: 'rem-sport-1',
        title: 'Gym Workout',
        notes: 'Leg day session',
        dueDate: tomorrow,
        dueTime: '07:00',
        category: 'SPORT',
        priority: 'MEDIUM',
        level: 'SIMPLE',
        completed: false,
        alertEnabled: true,
        createdAt: Date.now() - 1500,
      },
      {
        id: 'rem-fun-1',
        title: 'Cinema Night',
        notes: 'Watch new sci-fi movie',
        dueDate: inTwoDays,
        dueTime: '19:30',
        category: 'FUN',
        priority: 'LOW',
        level: 'SIMPLE',
        completed: false,
        alertEnabled: false,
        createdAt: Date.now() - 2000,
      },
      {
        id: 'rem-saving-1',
        title: 'Emergency Deposit',
        notes: 'Transfer $200 to Vault',
        dueDate: inThreeDays,
        dueTime: '09:00',
        category: 'SAVINGS',
        priority: 'HIGH',
        level: 'URGENT',
        completed: false,
        alertEnabled: true,
        createdAt: Date.now() - 2500,
      },
      {
        id: 'rem-task-1',
        title: 'Groceries',
        notes: 'Milk, eggs & fruits',
        dueDate: getTodayDateString(),
        dueTime: '10:00',
        category: 'TASK',
        priority: 'LOW',
        level: 'SIMPLE',
        completed: true,
        alertEnabled: false,
        createdAt: Date.now() - 3000,
      },
      {
        id: 'rem-health-1',
        title: 'Dental Checkup',
        notes: 'Routine cleaning appointment',
        dueDate: getTodayDateString(),
        dueTime: '11:00',
        category: 'HEALTH',
        priority: 'HIGH',
        level: 'URGENT',
        completed: true,
        alertEnabled: false,
        createdAt: Date.now() - 3500,
      },
    ];
    try {
      const local =
        localStorage.getItem('pitrack_reminders_data') ||
        localStorage.getItem(`reminders_${guestId}`);
      if (!local) {
        localStorage.setItem('pitrack_reminders_data', JSON.stringify(defaultDemoReminders));
        localStorage.setItem(`reminders_${guestId}`, JSON.stringify(defaultDemoReminders));
        return defaultDemoReminders;
      }
      const existing: ReminderItem[] = JSON.parse(local);
      const map = new Map<string, ReminderItem>();
      if (Array.isArray(existing)) {
        existing.forEach(r => map.set(r.id, r));
      }
      defaultDemoReminders.forEach(d => {
        if (!map.has(d.id)) {
          map.set(d.id, d);
        }
      });
      const merged = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
      try {
        localStorage.setItem('pitrack_reminders_data', JSON.stringify(merged));
        localStorage.setItem(`reminders_${guestId}`, JSON.stringify(merged));
      } catch (e) {}
      return merged;
    } catch (e) {
      return defaultDemoReminders;
    }
  },

  saveReminders(reminders: ReminderItem[]): void {
    const guestId = getGuestId();
    try {
      localStorage.setItem('pitrack_reminders_data', JSON.stringify(reminders));
      localStorage.setItem(`reminders_${guestId}`, JSON.stringify(reminders));
    } catch (e) {}
  },
};
