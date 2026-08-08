import { ExpenseItem, CurrencyCode, QuickPreset, TripFolder, ReminderItem, PlannerPreset, BudgetPeriod, CycleSnapshot } from '../types';

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

export const getStartOfWeekDateString = (d: Date = new Date()): string => {
  const curr = new Date(d);
  const day = curr.getDay(); // 0 is Sun, 1 is Mon
  const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(curr.setDate(diff));
  return getTodayDateString(monday);
};

export const getEndOfWeekDateString = (d: Date = new Date()): string => {
  const start = new Date(getStartOfWeekDateString(d));
  start.setDate(start.getDate() + 6);
  return getTodayDateString(start);
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

const DEFAULT_DEMO_EXPENSES: ExpenseItem[] = [];

const fetchWithTimeout = (url: string, options: RequestInit = {}) => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1200);

  return fetch(url, { ...options, signal: controller.signal })
    .then(res => {
      clearTimeout(timer);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return res.json();
      }
      return null;
    })
    .catch(() => {
      clearTimeout(timer);
      return null;
    });
};

export const StorageService = {
  getCachedExpenses(): ExpenseItem[] {
    const guestId = getGuestId();
    const isUserAccount = guestId.startsWith('usr_');

    try {
      const masterKey = `pitrack_expenses_${guestId}`;
      const userSpecific = localStorage.getItem(masterKey);
      if (userSpecific) {
        const parsed: ExpenseItem[] = JSON.parse(userSpecific);
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => b.createdAt - a.createdAt);
        }
      }

      if (isUserAccount) {
        return [];
      }

      const legacyRaw = localStorage.getItem('pitrack_expenses_data') || localStorage.getItem('pitrack_expenses');
      if (legacyRaw) {
        const parsed: ExpenseItem[] = JSON.parse(legacyRaw);
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => b.createdAt - a.createdAt);
        }
      }

      return [];
    } catch (e) {
      return [];
    }
  },
  syncAccountToCloud(): void {
    const guestId = getGuestId();
    if (!guestId.startsWith('usr_')) return;

    try {
      const expenses = this.getCachedExpenses();
      const reminders = this.getReminders();
      const trips = this.getTrips();
      const targets = this.getBudgetTargets();
      const goals = this.getSavingGoals();
      const cycleHistory = this.getCycleHistory();

      fetchWithTimeout('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-guest-id': guestId },
        body: JSON.stringify({
          accountId: guestId,
          expenses,
          reminders,
          trips,
          targets,
          goals,
          cycleHistory,
        }),
      });
    } catch (e) {}
  },

  async getExpenses(): Promise<ExpenseItem[]> {
    const guestId = getGuestId();
    const cached = this.getCachedExpenses();

    if (guestId.startsWith('usr_')) {
      try {
        const syncRes = await fetchWithTimeout(`/api/sync?accountId=${guestId}`, {
          headers: { 'x-guest-id': guestId },
        });

        if (syncRes && syncRes.expenses && Array.isArray(syncRes.expenses)) {
          localStorage.setItem(`pitrack_expenses_${guestId}`, JSON.stringify(syncRes.expenses));
          if (syncRes.reminders) localStorage.setItem(`reminders_${guestId}`, JSON.stringify(syncRes.reminders));
          if (syncRes.trips) localStorage.setItem(`trip_folders_${guestId}`, JSON.stringify(syncRes.trips));
          if (syncRes.targets) localStorage.setItem(`budget_targets_${guestId}`, JSON.stringify(syncRes.targets));
          if (syncRes.goals) localStorage.setItem(`saving_goals_${guestId}`, JSON.stringify(syncRes.goals));
          if (syncRes.cycleHistory) localStorage.setItem(`cycle_history_${guestId}`, JSON.stringify(syncRes.cycleHistory));
          return syncRes.expenses.sort((a: ExpenseItem, b: ExpenseItem) => b.createdAt - a.createdAt);
        }
      } catch (e) {}
    }

    try {
      const serverData = await fetchWithTimeout('/api/expenses', {
        headers: { 'x-guest-id': guestId },
      });

      if (Array.isArray(serverData) && serverData.length > 0) {
        localStorage.setItem(`pitrack_expenses_${guestId}`, JSON.stringify(serverData));
        return serverData.sort((a: ExpenseItem, b: ExpenseItem) => b.createdAt - a.createdAt);
      }
    } catch (e) {}

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
      localStorage.setItem(`pitrack_expenses_${guestId}`, JSON.stringify(updated));
      if (!guestId.startsWith('usr_')) {
        localStorage.setItem('pitrack_expenses_data', JSON.stringify(updated));
      }
    } catch (e) {}

    // 2. Fast non-blocking sync to API & account cloud
    fetchWithTimeout('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-guest-id': guestId,
      },
      body: JSON.stringify(newItem),
    });

    this.syncAccountToCloud();

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

    // 2. Fast non-blocking sync PUT
    fetchWithTimeout(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-guest-id': guestId,
      },
      body: JSON.stringify(updatedFields),
    });
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

    // 2. Fast non-blocking sync DELETE
    fetchWithTimeout(`/api/expenses/${id}`, {
      method: 'DELETE',
      headers: { 'x-guest-id': guestId },
    });
  },

  async clearAll(): Promise<void> {
    const guestId = getGuestId();
    try {
      localStorage.setItem('pitrack_expenses_data', JSON.stringify([]));
      localStorage.setItem(`pitrack_expenses_${guestId}`, JSON.stringify([]));
      localStorage.setItem('pitrack_expenses_initialized', 'true');
      localStorage.removeItem('expenses');
    } catch (e) {}

    fetchWithTimeout('/api/expenses/reset', {
      method: 'POST',
      headers: { 'x-guest-id': guestId },
    });
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
    const key = type === 'EXPENSE' ? `expense_presets_v3_${guestId}` : `saving_presets_v3_${guestId}`;
    try {
      const local = localStorage.getItem(key);
      if (!local) {
        localStorage.setItem(key, JSON.stringify(defaultList));
        return defaultList;
      }
      const parsed: QuickPreset[] = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length === 5) {
        return parsed;
      }
      localStorage.setItem(key, JSON.stringify(defaultList));
      return defaultList;
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

  getPlannerPresetsList(defaultList: PlannerPreset[]): PlannerPreset[] {
    const guestId = getGuestId();
    const key = `planner_presets_custom_${guestId}`;
    try {
      const local = localStorage.getItem(key) || localStorage.getItem('planner_presets_custom');
      if (!local) return defaultList;
      return JSON.parse(local);
    } catch (e) {
      return defaultList;
    }
  },

  savePlannerPresetsList(list: PlannerPreset[]): void {
    const guestId = getGuestId();
    const key = `planner_presets_custom_${guestId}`;
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {}
  },

  getBudgetPeriod(defaultVal: BudgetPeriod = 'MONTHLY'): BudgetPeriod {
    const guestId = getGuestId();
    try {
      const val = localStorage.getItem(`budget_period_${guestId}`) || localStorage.getItem('budget_period');
      if (val === 'DAILY' || val === 'WEEKLY' || val === 'MONTHLY') return val;
    } catch (e) {}
    return defaultVal;
  },

  saveBudgetPeriod(period: BudgetPeriod): void {
    const guestId = getGuestId();
    try {
      localStorage.setItem(`budget_period_${guestId}`, period);
    } catch (e) {}
  },

  getSavingPeriod(defaultVal: BudgetPeriod = 'MONTHLY'): BudgetPeriod {
    const guestId = getGuestId();
    try {
      const val = localStorage.getItem(`saving_period_${guestId}`) || localStorage.getItem('saving_period');
      if (val === 'DAILY' || val === 'WEEKLY' || val === 'MONTHLY') return val;
    } catch (e) {}
    return defaultVal;
  },

  saveSavingPeriod(period: BudgetPeriod): void {
    const guestId = getGuestId();
    try {
      localStorage.setItem(`saving_period_${guestId}`, period);
    } catch (e) {}
  },

  getBudgetTargets(): { DAILY: number; WEEKLY: number; MONTHLY: number } {
    const guestId = getGuestId();
    const defaults = { DAILY: 35, WEEKLY: 250, MONTHLY: 1000 };
    try {
      const saved = localStorage.getItem(`budget_targets_${guestId}`) || localStorage.getItem('budget_targets');
      if (saved) return { ...defaults, ...JSON.parse(saved) };
      const legacyMonthly = localStorage.getItem('monthly_budget_target');
      if (legacyMonthly) defaults.MONTHLY = parseFloat(legacyMonthly);
    } catch (e) {}
    return defaults;
  },

  saveBudgetTargets(targets: { DAILY: number; WEEKLY: number; MONTHLY: number }): void {
    const guestId = getGuestId();
    try {
      localStorage.setItem(`budget_targets_${guestId}`, JSON.stringify(targets));
    } catch (e) {}
    this.syncAccountToCloud();
  },

  getSavingGoals(): { DAILY: number; WEEKLY: number; MONTHLY: number } {
    const guestId = getGuestId();
    const defaults = { DAILY: 15, WEEKLY: 100, MONTHLY: 500 };
    try {
      const saved = localStorage.getItem(`saving_goals_${guestId}`) || localStorage.getItem('saving_goals');
      if (saved) return { ...defaults, ...JSON.parse(saved) };
      const legacyMonthly = localStorage.getItem('saving_goal_target');
      if (legacyMonthly) defaults.MONTHLY = parseFloat(legacyMonthly);
    } catch (e) {}
    return defaults;
  },

  saveSavingGoals(goals: { DAILY: number; WEEKLY: number; MONTHLY: number }): void {
    const guestId = getGuestId();
    try {
      localStorage.setItem(`saving_goals_${guestId}`, JSON.stringify(goals));
    } catch (e) {}
    this.syncAccountToCloud();
  },

  getCycleHistory(): CycleSnapshot[] {
    const guestId = getGuestId();
    try {
      const local = localStorage.getItem(`cycle_history_${guestId}`) || localStorage.getItem('cycle_history');
      if (!local) return [];
      return JSON.parse(local);
    } catch (e) {
      return [];
    }
  },

  saveCycleHistory(history: CycleSnapshot[]): void {
    const guestId = getGuestId();
    try {
      localStorage.setItem(`cycle_history_${guestId}`, JSON.stringify(history));
    } catch (e) {}
    this.syncAccountToCloud();
  },

  addCycleSnapshot(snapshot: Omit<CycleSnapshot, 'id' | 'archivedAt'>): CycleSnapshot {
    const current = this.getCycleHistory();
    const newSnapshot: CycleSnapshot = {
      ...snapshot,
      id: 'snap-' + Date.now(),
      archivedAt: Date.now(),
    };
    const updated = [newSnapshot, ...current];
    this.saveCycleHistory(updated);
    return newSnapshot;
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
      const userKey = `trip_folders_${guestId}`;
      const local = localStorage.getItem(userKey);
      if (local) {
        return JSON.parse(local);
      }
      if (guestId.startsWith('usr_')) {
        return [];
      }
      const fallback = localStorage.getItem('pitrack_trips_data');
      if (fallback) {
        return JSON.parse(fallback);
      }
      localStorage.setItem('pitrack_trips_data', JSON.stringify(defaultDemoTrips));
      localStorage.setItem(userKey, JSON.stringify(defaultDemoTrips));
      return defaultDemoTrips;
    } catch (e) {
      return defaultDemoTrips;
    }
  },

  saveTrips(trips: TripFolder[]): void {
    const guestId = getGuestId();
    try {
      localStorage.setItem(`trip_folders_${guestId}`, JSON.stringify(trips));
      if (!guestId.startsWith('usr_')) {
        localStorage.setItem('pitrack_trips_data', JSON.stringify(trips));
      }
    } catch (e) {}
    this.syncAccountToCloud();
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
      const userKey = `reminders_${guestId}`;
      const local = localStorage.getItem(userKey);
      if (local) {
        return JSON.parse(local);
      }
      if (guestId.startsWith('usr_')) {
        return [];
      }
      const fallback = localStorage.getItem('pitrack_reminders_data');
      if (fallback) {
        return JSON.parse(fallback);
      }
      localStorage.setItem('pitrack_reminders_data', JSON.stringify(defaultDemoReminders));
      localStorage.setItem(userKey, JSON.stringify(defaultDemoReminders));
      return defaultDemoReminders;
    } catch (e) {
      return defaultDemoReminders;
    }
  },

  saveReminders(reminders: ReminderItem[]): void {
    const guestId = getGuestId();
    try {
      localStorage.setItem(`reminders_${guestId}`, JSON.stringify(reminders));
      if (!guestId.startsWith('usr_')) {
        localStorage.setItem('pitrack_reminders_data', JSON.stringify(reminders));
      }
    } catch (e) {}
    this.syncAccountToCloud();
  },
};
