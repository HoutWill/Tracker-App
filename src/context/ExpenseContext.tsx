import React, { createContext, useContext, useState, useEffect } from 'react';
import { ExpenseItem, CurrencyCode, Category, PaymentMethod, TransactionType } from '../types';
import { StorageService } from '../services/storageService';
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
  hideBalances: boolean;
  addExpense: (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, updated: Partial<ExpenseItem>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
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
  setHideBalances: (hide: boolean) => void;
  reloadExpenses: () => Promise<void>;
  clearAllData: () => Promise<void>;
  exportCSVData: () => string;
}

const ExpenseContext = createContext<ExpenseContextType>({} as ExpenseContextType);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
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
  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(1000);
  const [hideBalances, setHideBalances] = useState<boolean>(false);

  const reloadExpenses = async () => {
    const list = await StorageService.getExpenses();
    setExpenses(list);
  };

  useEffect(() => {
    reloadExpenses();
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
  };

  const setMonthlyBudget = (amount: number) => {
    setMonthlyBudgetState(amount);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setPaymentFilter('ALL');
    setDateRangeFilter('ALL');
    setCategoryFilter(null);
    setSelectedDate(null);
    setSortBy('NEWEST');
    setActiveTypeTab('EXPENSE');
  };

  const addExpense = async (item: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    await StorageService.addExpense(item);
    await reloadExpenses();
  };

  const updateExpense = async (id: string, updatedFields: Partial<ExpenseItem>) => {
    await StorageService.updateExpense(id, updatedFields);
    await reloadExpenses();
  };

  const deleteExpense = async (id: string) => {
    await StorageService.deleteExpense(id);
    await reloadExpenses();
  };

  const clearAllData = async () => {
    await StorageService.clearAll();
    await reloadExpenses();
  };

  const exportCSVData = () => {
    const headers = ['Date', 'Title', 'Amount (USD)', 'Type', 'Category', 'Payment Method', 'Notes'];
    const rows = expenses.map(e => [
      `"${e.date}"`,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${e.amount}"`,
      `"${e.type || 'EXPENSE'}"`,
      `"${e.categoryName}"`,
      `"${e.paymentMethod}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  const currentList = Array.isArray(expenses) ? expenses : [];
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  let filtered = currentList.filter(item => {
    if (!item) return false;



    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchCat = (item.categoryName || '').toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      const matchPayment = (item.paymentMethod || '').toLowerCase().includes(q);
      const matchDate = (item.date || '').toLowerCase().includes(q);
      const matchAmount = item.amount.toString().includes(q);

      if (!matchTitle && !matchCat && !matchNotes && !matchPayment && !matchDate && !matchAmount) {
        return false;
      }
    }

    if (selectedDate && item.date !== selectedDate) {
      return false;
    }

    if (categoryFilter && item.categoryId !== categoryFilter) {
      return false;
    }

    if (paymentFilter !== 'ALL' && item.paymentMethod !== paymentFilter) {
      return false;
    }

    if (dateRangeFilter === 'TODAY' && item.date !== todayStr) {
      return false;
    }
    if (dateRangeFilter === 'THIS_MONTH' && !item.date.startsWith(currentMonthStr)) {
      return false;
    }

    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'NEWEST') {
      return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
    }
    if (sortBy === 'OLDEST') {
      return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
    }
    if (sortBy === 'HIGHEST') {
      return b.amount - a.amount;
    }
    if (sortBy === 'LOWEST') {
      return a.amount - b.amount;
    }
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
        hideBalances,
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
