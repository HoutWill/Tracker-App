import React, { createContext, useContext, useState, useEffect } from 'react';
import { ExpenseItem, CurrencyCode, Category, PaymentMethod, TransactionType, TripFolder, BudgetPeriod, CycleSnapshot } from '../types';
import { StorageService, getTodayDateString } from '../services/storageService';
import { DEFAULT_CATEGORIES } from '../constants/categories';

export type DateRangeOption = 'ALL' | 'THIS_MONTH' | 'THIS_WEEK' | 'TODAY';
export type SortOption = 'NEWEST' | 'OLDEST' | 'HIGHEST' | 'LOWEST';
export type TypeTabOption = 'EXPENSE' | 'SAVING' | 'ALL';

interface ExpenseContextType {
  expenses: ExpenseItem[];
  filteredExpenses: ExpenseItem[];
  categories: Category[];
  currency: CurrencyCode;
  selectedDate: string | null;
  searchQuery: string;
  paymentFilter: 'ALL' | PaymentMethod;
  dateRangeFilter: DateRangeOption;
  sortBy: SortOption;
  categoryFilter: string | null;
  activeTypeTab: TypeTabOption;
  isAddExpenseOpen: boolean;
  isAddSavingOpen: boolean;
  isAiChatOpen: boolean;
  selectedExpenseForEdit: ExpenseItem | null;
  monthlyBudget: number;
  savingGoal: number;
  budgetTargets: { DAILY: number; WEEKLY: number; MONTHLY: number };
  savingGoals: { DAILY: number; WEEKLY: number; MONTHLY: number };
  budgetPeriod: BudgetPeriod;
  savingPeriod: BudgetPeriod;
  cycleHistory: CycleSnapshot[];
  hideBalances: boolean;
  trips: TripFolder[];
  selectedTripId: string | null;
  selectedTripForEdit: TripFolder | null;
  isCreateTripOpen: boolean;
  isCreateExpenseFolderOpen: boolean;
  isCreateSavingFolderOpen: boolean;
  addTrip: (trip: Omit<TripFolder, 'id' | 'createdAt'>) => void;
  updateTrip: (id: string, updated: Partial<TripFolder>) => void;
  deleteTrip: (id: string) => void;
  setSelectedTripId: (id: string | null) => void;
  setSelectedTripForEdit: (trip: TripFolder | null) => void;
  setIsCreateTripOpen: (open: boolean) => void;
  setIsCreateExpenseFolderOpen: (open: boolean) => void;
  setIsCreateSavingFolderOpen: (open: boolean) => void;
  addExpense: (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updated: Partial<ExpenseItem>) => void;
  deleteExpense: (id: string) => void;
  setCurrency: (c: CurrencyCode) => void;
  setSelectedDate: (d: string | null) => void;
  setSearchQuery: (q: string) => void;
  setPaymentFilter: (pm: 'ALL' | PaymentMethod) => void;
  setDateRangeFilter: (dr: DateRangeOption) => void;
  setSortBy: (sb: SortOption) => void;
  setCategoryFilter: (catId: string | null) => void;
  setActiveTypeTab: (tab: TypeTabOption) => void;
  resetAllFilters: () => void;
  setIsAddExpenseOpen: (open: boolean) => void;
  setIsAddSavingOpen: (open: boolean) => void;
  setIsAiChatOpen: (open: boolean) => void;
  setSelectedExpenseForEdit: (item: ExpenseItem | null) => void;
  setMonthlyBudget: (amount: number) => void;
  setSavingGoal: (amount: number) => void;
  setBudgetTarget: (period: BudgetPeriod, amount: number) => void;
  setSavingGoalTarget: (period: BudgetPeriod, amount: number) => void;
  setBudgetPeriod: (period: BudgetPeriod) => void;
  setSavingPeriod: (period: BudgetPeriod) => void;
  archiveCycleSnapshot: (snapshot: Omit<CycleSnapshot, 'id' | 'archivedAt'>) => void;
  depositRolloverToSavings: (amount: number, note?: string) => void;
  setHideBalances: (hide: boolean) => void;
  reloadExpenses: () => Promise<void>;
  clearAllData: () => Promise<void>;
  exportCSVData: (typeFilter?: 'ALL' | 'EXPENSE' | 'SAVING', startDate?: string, endDate?: string) => string;
}

const ExpenseContext = createContext<ExpenseContextType>({} as ExpenseContextType);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => StorageService.getCachedExpenses());
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | PaymentMethod>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeOption>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [activeTypeTab, setActiveTypeTab] = useState<TypeTabOption>('EXPENSE');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isAddSavingOpen, setIsAddSavingOpen] = useState<boolean>(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<ExpenseItem | null>(null);

  // Trips / Event Folders state
  const [trips, setTrips] = useState<TripFolder[]>(() => StorageService.getTrips());
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedTripForEdit, setSelectedTripForEdit] = useState<TripFolder | null>(null);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState<boolean>(false);
  const [isCreateExpenseFolderOpen, setIsCreateExpenseFolderOpen] = useState<boolean>(false);
  const [isCreateSavingFolderOpen, setIsCreateSavingFolderOpen] = useState<boolean>(false);

  const [budgetTargets, setBudgetTargetsState] = useState<{ DAILY: number; WEEKLY: number; MONTHLY: number }>(() => StorageService.getBudgetTargets());
  const [savingGoals, setSavingGoalsState] = useState<{ DAILY: number; WEEKLY: number; MONTHLY: number }>(() => StorageService.getSavingGoals());

  const [budgetPeriod, setBudgetPeriodState] = useState<BudgetPeriod>(() => StorageService.getBudgetPeriod('MONTHLY'));
  const [savingPeriod, setSavingPeriodState] = useState<BudgetPeriod>(() => StorageService.getSavingPeriod('MONTHLY'));
  const [cycleHistory, setCycleHistory] = useState<CycleSnapshot[]>(() => StorageService.getCycleHistory());

  const monthlyBudget = budgetTargets[budgetPeriod];
  const savingGoal = savingGoals[savingPeriod];

  const setBudgetTarget = (period: BudgetPeriod, amount: number) => {
    const updated = { ...budgetTargets, [period]: amount };
    setBudgetTargetsState(updated);
    StorageService.saveBudgetTargets(updated);
  };

  const setSavingGoalTarget = (period: BudgetPeriod, amount: number) => {
    const updated = { ...savingGoals, [period]: amount };
    setSavingGoalsState(updated);
    StorageService.saveSavingGoals(updated);
  };

  const setMonthlyBudget = (amount: number) => {
    setBudgetTarget(budgetPeriod, amount);
  };

  const setSavingGoal = (amount: number) => {
    setSavingGoalTarget(savingPeriod, amount);
  };

  const [hideBalances, setHideBalances] = useState<boolean>(false);

  const archiveCycleSnapshot = (snapshot: Omit<CycleSnapshot, 'id' | 'archivedAt'>) => {
    const newSnap = StorageService.addCycleSnapshot(snapshot);
    setCycleHistory(prev => [newSnap, ...prev]);
  };

  const depositRolloverToSavings = (amount: number, note?: string) => {
    if (amount <= 0) return;
    const cat = categories.find(c => c.type === 'SAVING' || c.id.startsWith('cat-saving')) || categories[0];
    addExpense({
      title: 'Rollover',
      amount,
      currency: currency,
      type: 'SAVING',
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon || 'piggy-bank',
      categoryColor: cat.color || '#00B894',
      date: getTodayDateString(),
      paymentMethod: 'Bank',
      notes: note || 'Budget Surplus Rollover Deposit',
    });
  };

  const reloadExpenses = async () => {
    const list = await StorageService.getExpenses();
    setExpenses(list);
    setCycleHistory(StorageService.getCycleHistory());
  };

  useEffect(() => {
    reloadExpenses();
  }, []);

  const addTrip = (item: Omit<TripFolder, 'id' | 'createdAt'>) => {
    const newTrip: TripFolder = {
      ...item,
      id: 'trip-' + Date.now(),
      createdAt: Date.now(),
    };
    const updated = [newTrip, ...trips];
    setTrips(updated);
    StorageService.saveTrips(updated);
    setSelectedTripId(newTrip.id);
  };

  const updateTrip = (id: string, updated: Partial<TripFolder>) => {
    const updatedList = trips.map(t => (t.id === id ? { ...t, ...updated } : t));
    setTrips(updatedList);
    StorageService.saveTrips(updatedList);
  };

  const deleteTrip = (id: string) => {
    const updated = trips.filter(t => t.id !== id);
    setTrips(updated);
    StorageService.saveTrips(updated);
    if (selectedTripId === id) {
      setSelectedTripId(null);
    }
  };

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
  };

  const setBudgetPeriod = (period: BudgetPeriod) => {
    setBudgetPeriodState(period);
    StorageService.saveBudgetPeriod(period);
  };

  const setSavingPeriod = (period: BudgetPeriod) => {
    setSavingPeriodState(period);
    StorageService.saveSavingPeriod(period);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setPaymentFilter('ALL');
    setDateRangeFilter('ALL');
    setCategoryFilter(null);
    setSelectedDate(null);
    setSelectedTripId(null);
    setSortBy('NEWEST');
    setActiveTypeTab('EXPENSE');
  };

  const addExpense = async (item: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    let assignedTripId = item.tripId;
    if (!assignedTripId && selectedTripId) {
      assignedTripId = selectedTripId;
    } else if (!assignedTripId) {
      const match = trips.find(t =>
        t.name.toLowerCase() === item.title.toLowerCase() ||
        t.category.toLowerCase() === item.title.toLowerCase() ||
        t.name.toLowerCase() === item.categoryName.toLowerCase() ||
        t.category.toLowerCase() === item.categoryName.toLowerCase()
      );
      if (match) assignedTripId = match.id;
    }

    const newItem: ExpenseItem = {
      ...item,
      tripId: assignedTripId,
      id: 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: Date.now(),
    };
    // 1. Instant Optimistic State Update for 0ms UI lag
    setExpenses(prev => [newItem, ...prev.filter(e => e.id !== newItem.id)]);

    // 2. Non-blocking background sync to storage and API
    StorageService.addExpense(newItem);
  };

  const updateExpense = (id: string, updated: Partial<ExpenseItem>) => {
    // 1. Instant Optimistic State Update
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...updated } : e)));

    // 2. Non-blocking background sync
    StorageService.updateExpense(id, updated);
  };

  const deleteExpense = (id: string) => {
    // 1. Instant Optimistic State Update
    setExpenses(prev => prev.filter(e => e.id !== id));

    // 2. Non-blocking background sync
    StorageService.deleteExpense(id);
  };

  const clearAllData = async () => {
    setExpenses([]);
    await StorageService.clearAll();
  };

  const exportCSVData = (typeFilter?: 'ALL' | 'EXPENSE' | 'SAVING', startDate?: string, endDate?: string): string => {
    const headers = ['ID', 'Title', 'Amount', 'Currency', 'Category', 'Type', 'Date', 'PaymentMethod', 'Notes'];
    let list = [...expenses];

    if (typeFilter && typeFilter !== 'ALL') {
      list = list.filter(e => {
        if (typeFilter === 'SAVING') return e.type === 'SAVING' || e.categoryId.startsWith('cat-saving');
        return e.type !== 'SAVING' && !e.categoryId.startsWith('cat-saving');
      });
    }

    if (startDate) {
      list = list.filter(e => e.date >= startDate);
    }
    if (endDate) {
      list = list.filter(e => e.date <= endDate);
    }

    const rows = list.map(e => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount,
      e.currency,
      `"${e.categoryName}"`,
      e.type || 'EXPENSE',
      e.date,
      e.paymentMethod,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  // Filtered expenses calculation
  let filtered = [...expenses];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      e => e.title.toLowerCase().includes(q) || e.categoryName.toLowerCase().includes(q)
    );
  }

  if (categoryFilter) {
    filtered = filtered.filter(e => e.categoryId === categoryFilter);
  }

  if (selectedTripId) {
    const activeTrip = trips.find(t => t.id === selectedTripId);
    if (activeTrip) {
      const tripCat = activeTrip.category.toLowerCase();
      const tripName = activeTrip.name.toLowerCase();
      filtered = filtered.filter(e => {
        if (e.tripId === selectedTripId) return true;
        if (e.categoryName.toLowerCase() === tripName || e.categoryName.toLowerCase() === tripCat) return true;
        if (e.categoryId.toLowerCase().includes(tripCat) || e.categoryId.toLowerCase().includes(tripName)) return true;
        if (e.title.toLowerCase().includes(tripName) || e.title.toLowerCase().includes(tripCat)) return true;
        return false;
      });
    }
  }

  if (paymentFilter !== 'ALL') {
    filtered = filtered.filter(e => e.paymentMethod === paymentFilter);
  }

  if (selectedDate) {
    filtered = filtered.filter(e => e.date === selectedDate);
  } else if (dateRangeFilter !== 'ALL') {
    const now = new Date();
    if (dateRangeFilter === 'TODAY') {
      const todayStr = getTodayDateString(now);
      filtered = filtered.filter(e => e.date === todayStr);
    } else if (dateRangeFilter === 'THIS_MONTH') {
      const monthPrefix = getTodayDateString(now).slice(0, 7);
      filtered = filtered.filter(e => e.date.startsWith(monthPrefix));
    }
  }

  filtered.sort((a, b) => {
    if (sortBy === 'NEWEST') return b.createdAt - a.createdAt;
    if (sortBy === 'OLDEST') return a.createdAt - b.createdAt;
    if (sortBy === 'HIGHEST') return b.amount - a.amount;
    if (sortBy === 'LOWEST') return a.amount - b.amount;
    return 0;
  });

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        filteredExpenses: filtered,
        categories,
        currency,
        selectedDate,
        searchQuery,
        paymentFilter,
        dateRangeFilter,
        sortBy,
        categoryFilter,
        activeTypeTab,
        isAddExpenseOpen,
        isAddSavingOpen,
        isAiChatOpen,
        selectedExpenseForEdit,
        monthlyBudget,
        savingGoal,
        budgetTargets,
        savingGoals,
        budgetPeriod,
        savingPeriod,
        cycleHistory,
        hideBalances,
        trips,
        selectedTripId,
        selectedTripForEdit,
        isCreateTripOpen,
        isCreateExpenseFolderOpen,
        isCreateSavingFolderOpen,
        addTrip,
        updateTrip,
        deleteTrip,
        setSelectedTripId,
        setSelectedTripForEdit,
        setIsCreateTripOpen,
        setIsCreateExpenseFolderOpen,
        setIsCreateSavingFolderOpen,
        addExpense,
        updateExpense,
        deleteExpense,
        setCurrency,
        setSelectedDate,
        setSearchQuery,
        setPaymentFilter,
        setDateRangeFilter,
        setSortBy,
        setCategoryFilter,
        setActiveTypeTab,
        resetAllFilters,
        setIsAddExpenseOpen,
        setIsAddSavingOpen,
        setIsAiChatOpen,
        setSelectedExpenseForEdit,
        setMonthlyBudget,
        setSavingGoal,
        setBudgetTarget,
        setSavingGoalTarget,
        setBudgetPeriod,
        setSavingPeriod,
        archiveCycleSnapshot,
        depositRolloverToSavings,
        setHideBalances,
        reloadExpenses,
        clearAllData,
        exportCSVData,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
