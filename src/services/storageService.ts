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

export const getNowTimeString = (d: Date = new Date()): string => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Phnom_Penh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  });
  return formatter.format(d);
};

export const getReminderDueTimestamp = (r: ReminderItem): number => {
  const targetDate = (r.alertDate || r.dueDate || '').trim();
  if (!targetDate) return NaN;

  const dateParts = targetDate.split('-');
  if (dateParts.length < 3) return NaN;

  const y = parseInt(dateParts[0], 10);
  const m = parseInt(dateParts[1], 10);
  const d = parseInt(dateParts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return NaN;

  const rawTime = (r.alertTime || r.dueTime || '09:00').trim();
  const timeParts = rawTime.split(':');
  const hour = parseInt(timeParts[0] || '9', 10);
  const minute = parseInt(timeParts[1] || '0', 10);

  // Timezone Directive: Cambodia (ICT / UTC+7).
  // A local Cambodia time of Y-M-D H:M corresponds to UTC timestamp:
  // Date.UTC(y, m - 1, d, hour - 7, minute, 0)
  return Date.UTC(y, m - 1, d, hour - 7, minute, 0);
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

export const sanitizeExpenseItem = (item: any): ExpenseItem | null => {
  if (!item || typeof item !== 'object') return null;

  const rawAmount = typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount));
  if (isNaN(rawAmount) || !isFinite(rawAmount) || rawAmount < 0) return null;

  const rawTitle = typeof item.title === 'string' ? item.title.trim() : '';
  const title = rawTitle.slice(0, 150) || 'Expense';

  const type = item.type === 'SAVING' || (typeof item.categoryId === 'string' && item.categoryId.startsWith('cat-saving')) ? 'SAVING' : 'EXPENSE';
  const currency = item.currency === 'KHR' ? 'KHR' : 'USD';
  const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim().slice(0, 100) : ('exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
  const createdAt = typeof item.createdAt === 'number' && isFinite(item.createdAt) ? item.createdAt : Date.now();
  const date = typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(item.date) ? item.date.slice(0, 10) : getTodayDateString();

  return {
    id,
    title,
    amount: rawAmount,
    currency,
    type,
    categoryId: typeof item.categoryId === 'string' && item.categoryId.trim() ? item.categoryId.trim().slice(0, 50) : (type === 'SAVING' ? 'cat-saving-vault' : 'cat-food'),
    categoryName: typeof item.categoryName === 'string' && item.categoryName.trim() ? item.categoryName.trim().slice(0, 50) : 'General',
    categoryIcon: typeof item.categoryIcon === 'string' && item.categoryIcon.trim() ? item.categoryIcon.trim().slice(0, 50) : 'receipt',
    categoryColor: typeof item.categoryColor === 'string' && item.categoryColor.trim() ? item.categoryColor.trim().slice(0, 30) : '#6C5CE7',
    date,
    paymentMethod: typeof item.paymentMethod === 'string' && item.paymentMethod.trim() ? item.paymentMethod.trim().slice(0, 30) : 'Cash',
    notes: typeof item.notes === 'string' ? item.notes.slice(0, 1000) : '',
    tripId: typeof item.tripId === 'string' && item.tripId.trim() ? item.tripId.trim().slice(0, 80) : undefined,
    createdAt,
  };
};

export const sanitizeTripFolder = (trip: any): TripFolder | null => {
  if (!trip || typeof trip !== 'object') return null;
  const rawBudget = typeof trip.budget === 'number' ? trip.budget : parseFloat(String(trip.budget));
  const budget = !isNaN(rawBudget) && isFinite(rawBudget) && rawBudget > 0 ? rawBudget : 100;
  const name = typeof trip.name === 'string' && trip.name.trim() ? trip.name.trim().slice(0, 50) : 'Trip';
  const id = typeof trip.id === 'string' && trip.id.trim() ? trip.id.trim().slice(0, 80) : ('trip-' + Date.now());
  const category = typeof trip.category === 'string' && trip.category.trim() ? trip.category.trim().slice(0, 50) : name;
  const currency = trip.currency === 'KHR' ? 'KHR' : 'USD';
  const startDate = typeof trip.startDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(trip.startDate) ? trip.startDate.slice(0, 10) : getTodayDateString();
  const endDate = typeof trip.endDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(trip.endDate) ? trip.endDate.slice(0, 10) : startDate;
  const type = trip.type === 'SAVING' ? 'SAVING' : 'EXPENSE';

  return {
    id,
    name,
    category,
    budget,
    currency,
    startDate,
    endDate: endDate >= startDate ? endDate : startDate,
    status: trip.status === 'Closed' ? 'Closed' : 'Active',
    type,
    createdAt: typeof trip.createdAt === 'number' && isFinite(trip.createdAt) ? trip.createdAt : Date.now(),
  };
};

export const sanitizeReminderItem = (r: any): ReminderItem | null => {
  if (!r || typeof r !== 'object') return null;
  const rawTitle = typeof r.title === 'string' ? r.title.trim() : '';
  if (!rawTitle) return null;

  return {
    id: typeof r.id === 'string' && r.id.trim() ? r.id.trim().slice(0, 80) : ('rem-' + Date.now()),
    title: rawTitle.slice(0, 150),
    notes: typeof r.notes === 'string' ? r.notes.slice(0, 2000) : '',
    category: typeof r.category === 'string' ? r.category : 'TASK',
    priority: r.priority === 'HIGH' ? 'HIGH' : r.priority === 'LOW' ? 'LOW' : 'MEDIUM',
    level: r.level === 'URGENT' ? 'URGENT' : r.level === 'FLAGGED' ? 'FLAGGED' : 'SIMPLE',
    dueDate: typeof r.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(r.dueDate) ? r.dueDate.slice(0, 10) : getTodayDateString(),
    dueTime: typeof r.dueTime === 'string' ? r.dueTime.slice(0, 10) : '09:00',
    endTime: typeof r.endTime === 'string' ? r.endTime.slice(0, 10) : undefined,
    alertDate: typeof r.alertDate === 'string' ? r.alertDate.slice(0, 10) : undefined,
    alertTime: typeof r.alertTime === 'string' ? r.alertTime.slice(0, 10) : undefined,
    alertEnabled: r.alertEnabled !== false,
    completed: Boolean(r.completed),
    notifiedAt: typeof r.notifiedAt === 'number' ? r.notifiedAt : undefined,
    createdAt: typeof r.createdAt === 'number' && isFinite(r.createdAt) ? r.createdAt : Date.now(),
    checklist: Array.isArray(r.checklist) ? r.checklist.map((c: any) => ({
      id: typeof c.id === 'string' ? c.id : ('cl-' + Math.random()),
      text: typeof c.text === 'string' ? c.text.slice(0, 100) : '',
      done: Boolean(c.done),
    })) : undefined,
  };
};

export const StorageService = {
  getCachedExpenses(): ExpenseItem[] {
    const guestId = String(getGuestId());

    try {
      const masterKey = `pitrack_expenses_${guestId}`;
      const userSpecific = localStorage.getItem(masterKey);
      if (userSpecific) {
        const parsed = JSON.parse(userSpecific);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.map(sanitizeExpenseItem).filter((e): e is ExpenseItem => e !== null);
          return sanitized.sort((a, b) => b.createdAt - a.createdAt);
        }
      }

      const legacyRaw = localStorage.getItem('pitrack_expenses_data') || localStorage.getItem('pitrack_expenses');
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map(sanitizeExpenseItem).filter((e): e is ExpenseItem => e !== null);
          localStorage.setItem(masterKey, JSON.stringify(sanitized));
          return sanitized.sort((a, b) => b.createdAt - a.createdAt);
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
    const sanitized = sanitizeExpenseItem(item);
    if (!sanitized) {
      throw new Error('Invalid expense data. Please check title and amount.');
    }
    const newItem: ExpenseItem = sanitized;

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
    if (!id || typeof id !== 'string') return;
    const cleanId = id.trim();
    const guestId = getGuestId();

    // Validate updated amount if present
    if (updatedFields.amount !== undefined) {
      const raw = typeof updatedFields.amount === 'number' ? updatedFields.amount : parseFloat(String(updatedFields.amount));
      if (isNaN(raw) || !isFinite(raw) || raw <= 0) {
        console.warn('Invalid update amount:', updatedFields.amount);
        return;
      }
      updatedFields.amount = raw;
    }

    // Validate title if present
    if (updatedFields.title !== undefined) {
      const cleanTitle = updatedFields.title.trim();
      if (!cleanTitle) {
        console.warn('Empty title rejected');
        return;
      }
      updatedFields.title = cleanTitle.slice(0, 150);
    }

    // 1. Update local cache synchronously
    try {
      const current = this.getCachedExpenses();
      const updated = current.map(e => (e.id === cleanId ? { ...e, ...updatedFields } : e));
      localStorage.setItem('pitrack_expenses_data', JSON.stringify(updated));
      localStorage.setItem(`pitrack_expenses_${guestId}`, JSON.stringify(updated));
    } catch (e) {}

    // 2. Fast non-blocking sync PUT
    fetchWithTimeout(`/api/expenses/${cleanId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-guest-id': guestId,
      },
      body: JSON.stringify(updatedFields),
    });
  },

  async deleteExpense(id: string): Promise<void> {
    if (!id || typeof id !== 'string') return;
    const cleanId = id.trim();
    const guestId = getGuestId();

    // 1. Update local cache synchronously
    try {
      const current = this.getCachedExpenses();
      const updated = current.filter(e => e.id !== cleanId);
      localStorage.setItem('pitrack_expenses_data', JSON.stringify(updated));
      localStorage.setItem(`pitrack_expenses_${guestId}`, JSON.stringify(updated));
    } catch (e) {}

    // 2. Fast non-blocking sync DELETE
    fetchWithTimeout(`/api/expenses/${cleanId}`, {
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
        startDate: getTodayDateString(),
        endDate: getTodayDateString(new Date(Date.now() + 2 * 86400000)),
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
        startDate: getTodayDateString(),
        endDate: getTodayDateString(new Date(Date.now() + 1 * 86400000)),
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
        startDate: getTodayDateString(),
        endDate: getTodayDateString(new Date(Date.now() + 30 * 86400000)),
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
        startDate: getTodayDateString(),
        endDate: getTodayDateString(new Date(Date.now() + 60 * 86400000)),
        createdAt: Date.now() - 3000,
        status: 'Active',
        type: 'SAVING',
      },
    ];
    try {
      const userKey = `trip_folders_${guestId}`;
      const local = localStorage.getItem(userKey);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed.map(sanitizeTripFolder).filter((t): t is TripFolder => t !== null);
        }
      }
      if (isUserAccount()) {
        return [];
      }
      const fallback = localStorage.getItem('pitrack_trips_data');
      if (fallback) {
        const parsed = JSON.parse(fallback);
        if (Array.isArray(parsed)) {
          return parsed.map(sanitizeTripFolder).filter((t): t is TripFolder => t !== null);
        }
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
    const sanitized = Array.isArray(trips) ? trips.map(sanitizeTripFolder).filter((t): t is TripFolder => t !== null) : [];
    try {
      localStorage.setItem(`trip_folders_${guestId}`, JSON.stringify(sanitized));
      if (!isUserAccount()) {
        localStorage.setItem('pitrack_trips_data', JSON.stringify(sanitized));
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
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed.map(sanitizeReminderItem).filter((r): r is ReminderItem => r !== null);
        }
      }
      // Auto-migrate guest reminders into user account key so data is never lost on login
      const fallback = localStorage.getItem('pitrack_reminders_backup') || localStorage.getItem('reminders_v2_usr_default');
      if (fallback) {
        const parsed = JSON.parse(fallback);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map(sanitizeReminderItem).filter((r): r is ReminderItem => r !== null);
          localStorage.setItem(userKey, JSON.stringify(sanitized));
          return sanitized;
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  },

  saveReminders(reminders: ReminderItem[]): void {
    const guestId = getGuestId();
    const sanitized = Array.isArray(reminders) ? reminders.map(sanitizeReminderItem).filter((r): r is ReminderItem => r !== null) : [];
    try {
      localStorage.setItem(`reminders_v2_${guestId}`, JSON.stringify(sanitized));
      localStorage.setItem('pitrack_reminders_backup', JSON.stringify(sanitized));
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

  getLastActiveMonth(): string | null {
    const guestId = getGuestId();
    try {
      return localStorage.getItem(`pitrack_active_month_${guestId}`) || localStorage.getItem('pitrack_active_month');
    } catch (e) {
      return null;
    }
  },

  setLastActiveMonth(month: string): void {
    const guestId = getGuestId();
    try {
      localStorage.setItem(`pitrack_active_month_${guestId}`, month);
      localStorage.setItem('pitrack_active_month', month);
    } catch (e) {}
  },

  checkAndRunMonthlyRollover(): CycleSnapshot | null {
    const currentMonth = getTodayDateString().slice(0, 7);
    const lastMonth = this.getLastActiveMonth();

    if (!lastMonth) {
      this.setLastActiveMonth(currentMonth);
      return null;
    }

    if (lastMonth !== currentMonth) {
      const history = this.getCycleHistory();
      const alreadyArchived = history.some(h => h.period === 'MONTHLY' && h.periodKey === lastMonth);

      let snapshotCreated: CycleSnapshot | null = null;
      if (!alreadyArchived) {
        const allExpenses = this.getCachedExpenses();
        const lastMonthExpenses = allExpenses.filter(e =>
          (e.type === 'EXPENSE' || (!e.type && !e.categoryId.startsWith('cat-saving'))) &&
          e.date.startsWith(lastMonth)
        );

        const totalSpent = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);
        const targets = this.getBudgetTargets();
        const targetMonthly = targets.MONTHLY || 1000;
        const surplusOrDeficit = targetMonthly - totalSpent;

        snapshotCreated = this.addCycleSnapshot({
          type: 'BUDGET',
          period: 'MONTHLY',
          periodKey: lastMonth,
          targetAmount: targetMonthly,
          actualAmount: totalSpent,
          status: surplusOrDeficit >= 0 ? 'SURPLUS' : 'OVERRUN',
          surplusAmount: Math.max(0, surplusOrDeficit),
        });
      }

      this.setLastActiveMonth(currentMonth);
      return snapshotCreated;
    }

    return null;
  },
};
