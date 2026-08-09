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
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d);
};

export const getStartOfWeekDateString = (d: Date = new Date()): string => {
  const todayStr = getTodayDateString(d);
  const [year, month, day] = todayStr.split('-').map(Number);
  const curr = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = curr.getUTCDay(); // 0 is Sun, 1 is Mon
  const diff = curr.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(Date.UTC(year, month - 1, diff));
  const mondayYear = monday.getUTCFullYear();
  const mondayMonth = String(monday.getUTCMonth() + 1).padStart(2, '0');
  const mondayDay = String(monday.getUTCDate()).padStart(2, '0');
  return `${mondayYear}-${mondayMonth}-${mondayDay}`;
};

export const getEndOfWeekDateString = (d: Date = new Date()): string => {
  const mondayStr = getStartOfWeekDateString(d);
  const [year, month, day] = mondayStr.split('-').map(Number);
  const monday = new Date(Date.UTC(year, month - 1, day));
  monday.setUTCDate(monday.getUTCDate() + 6);
  const sundayYear = monday.getUTCFullYear();
  const sundayMonth = String(monday.getUTCMonth() + 1).padStart(2, '0');
  const sundayDay = String(monday.getUTCDate()).padStart(2, '0');
  return `${sundayYear}-${sundayMonth}-${sundayDay}`;
};

export const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatCleanDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-');
    const mIdx = parseInt(month, 10) - 1;
    const dayPad = day.padStart(2, '0');
    const shortYear = year.slice(2);
    const mName = SHORT_MONTH_NAMES[mIdx] || 'Jan';
    return `${dayPad} ${mName} ${shortYear}`;
  }
  const parsedDate = new Date(trimmed);
  if (!isNaN(parsedDate.getTime())) {
    const dayPad = String(parsedDate.getDate()).padStart(2, '0');
    const mName = SHORT_MONTH_NAMES[parsedDate.getMonth()] || 'Jan';
    const shortYear = String(parsedDate.getFullYear()).slice(2);
    return `${dayPad} ${mName} ${shortYear}`;
  }
  return trimmed.replace(/[\/-]/g, ' ');
};


export const getGuestId = (): string => {
  try {
    const userAcc = localStorage.getItem('user_account');
    if (userAcc) {
      const parsed = JSON.parse(userAcc);
      if (parsed && (parsed.pkid !== undefined || parsed.accountId !== undefined)) {
        const rawId = parsed.pkid !== undefined && parsed.pkid !== null ? parsed.pkid : parsed.accountId;
        return String(rawId);
      }
    }
    let gid = localStorage.getItem('guest_device_id');
    if (!gid) {
      gid = 'usr_session_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('guest_device_id', gid);
    }
    return String(gid);
  } catch (e) {
    return 'usr_default';
  }
};

export const setGuestId = (newId: string | number): void => {
  try {
    localStorage.setItem('guest_device_id', String(newId).trim());
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

export const isUserAccount = (): boolean => {
  try {
    const userAcc = localStorage.getItem('user_account');
    if (userAcc) return true;
    const gid = getGuestId();
    return gid.startsWith('usr_') || (!isNaN(Number(gid)) && Number(gid) > 0);
  } catch (e) {
    return false;
  }
};

export const StorageService = {
  getCachedExpenses(): ExpenseItem[] {
    const guestId = String(getGuestId());
    const isUser = isUserAccount();

    try {
      const masterKey = `pitrack_expenses_${guestId}`;
      const userSpecific = localStorage.getItem(masterKey);
      if (userSpecific) {
        const parsed: ExpenseItem[] = JSON.parse(userSpecific);
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => b.createdAt - a.createdAt);
        }
      }

      const legacyRaw = localStorage.getItem('pitrack_expenses_data') || localStorage.getItem('pitrack_expenses');
      if (legacyRaw) {
        const parsed: ExpenseItem[] = JSON.parse(legacyRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Auto-migrate guest expenses to user account key so data is never lost on login
          localStorage.setItem(masterKey, JSON.stringify(parsed));
          return parsed.sort((a, b) => b.createdAt - a.createdAt);
        }
      }

      return [];
    } catch (e) {
      return [];
    }
  },
  syncAccountToCloud(): void {
    const guestId = String(getGuestId());
    if (!isUserAccount()) return;

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
          pkid: guestId,
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
    const guestId = String(getGuestId());
    const cached = this.getCachedExpenses();

    if (isUserAccount()) {
      try {
        const syncRes = await fetchWithTimeout(`/api/sync?pkid=${guestId}`, {
          headers: { 'x-guest-id': guestId },
        });

        if (syncRes && syncRes.expenses && Array.isArray(syncRes.expenses)) {
          localStorage.setItem(`pitrack_expenses_${guestId}`, JSON.stringify(syncRes.expenses));
          if (syncRes.reminders) localStorage.setItem(`reminders_v2_${guestId}`, JSON.stringify(syncRes.reminders));
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
    const guestId = String(getGuestId());
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
      if (!isUserAccount()) {
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
    const guestId = String(getGuestId());
    const key = type === 'EXPENSE' ? `expense_presets_v3_${guestId}` : `saving_presets_v3_${guestId}`;
    try {
      const local = localStorage.getItem(key);
      if (!local) {
        localStorage.setItem(key, JSON.stringify(defaultList));
        return defaultList;
      }
      const parsed: QuickPreset[] = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      localStorage.setItem(key, JSON.stringify(defaultList));
      return defaultList;
    } catch (e) {
      return defaultList;
    }
  },

  savePresetsList(type: 'EXPENSE' | 'SAVING', list: QuickPreset[]): void {
    const guestId = String(getGuestId());
    const key = type === 'EXPENSE' ? `expense_presets_v3_${guestId}` : `saving_presets_v3_${guestId}`;
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {}
  },

  getPlannerPresetsList(defaultList: PlannerPreset[]): PlannerPreset[] {
    const guestId = String(getGuestId());
    const key = `planner_presets_v2_${guestId}`;
    try {
      const local = localStorage.getItem(key);
      if (!local) {
        localStorage.setItem(key, JSON.stringify(defaultList));
        return defaultList;
      }
      const parsed: PlannerPreset[] = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      localStorage.setItem(key, JSON.stringify(defaultList));
      return defaultList;
    } catch (e) {
      return defaultList;
    }
  },

  savePlannerPresetsList(list: PlannerPreset[]): void {
    const guestId = getGuestId();
    const key = `planner_presets_v2_${guestId}`;
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
      if (isUserAccount()) {
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
    const guestId = String(getGuestId());
    try {
      localStorage.setItem(`trip_folders_${guestId}`, JSON.stringify(trips));
      if (!isUserAccount()) {
        localStorage.setItem('pitrack_trips_data', JSON.stringify(trips));
      }
    } catch (e) {}
    this.syncAccountToCloud();
  },

  getReminders(): ReminderItem[] {
    const guestId = getGuestId();
    try {
      const userKey = `reminders_v2_${guestId}`;
      const local = localStorage.getItem(userKey);
      if (local) {
        return JSON.parse(local);
      }
      // Auto-migrate guest reminders into user account key so data is never lost on login
      const fallback = localStorage.getItem('pitrack_reminders_backup') || localStorage.getItem('reminders_v2_usr_default');
      if (fallback) {
        const parsed = JSON.parse(fallback);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(userKey, JSON.stringify(parsed));
          return parsed;
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  },

  saveReminders(reminders: ReminderItem[]): void {
    const guestId = getGuestId();
    try {
      localStorage.setItem(`reminders_v2_${guestId}`, JSON.stringify(reminders));
      localStorage.setItem('pitrack_reminders_backup', JSON.stringify(reminders));
    } catch (e) {}
    this.syncAccountToCloud();
  },

  getHideBalances(): boolean {
    try {
      const val = localStorage.getItem('pitrack_hide_balances');
      return val === 'true';
    } catch (e) {
      return false;
    }
  },

  saveHideBalances(hide: boolean): void {
    try {
      localStorage.setItem('pitrack_hide_balances', String(hide));
    } catch (e) {}
  },
};
