import React, { createContext, useContext, useState, useEffect } from 'react';
import { ExpenseItem, CurrencyCode, Category } from '../types';
import { StorageService } from '../services/storageService';
import { DEFAULT_CATEGORIES } from '../constants/categories';

import { generateSampleExpenses } from '../services/storageService';

interface ExpenseContextType {
  expenses: ExpenseItem[];
  categories: Category[];
  currency: CurrencyCode;
  selectedDate: string | null;
  searchQuery: string;
  isQuickAddOpen: boolean;
  isAiChatOpen: boolean;
  selectedExpenseForEdit: ExpenseItem | null;
  addExpense: (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, updated: Partial<ExpenseItem>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setCurrency: (c: CurrencyCode) => void;
  setSelectedDate: (d: string | null) => void;
  setSearchQuery: (q: string) => void;
  setIsQuickAddOpen: (open: boolean) => void;
  setIsAiChatOpen: (open: boolean) => void;
  setSelectedExpenseForEdit: (item: ExpenseItem | null) => void;
  reloadExpenses: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType>({} as ExpenseContextType);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(generateSampleExpenses());
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<ExpenseItem | null>(null);

  const reloadExpenses = async () => {
    const list = await StorageService.getExpenses();
    // Sort by date desc
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt);
    setExpenses(list);
  };

  useEffect(() => {
    reloadExpenses();
    StorageService.getCurrency().then(setCurrencyState);
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    StorageService.saveCurrency(c);
  };

  const addExpense = async (item: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    const newItem: ExpenseItem = {
      ...item,
      id: 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: Date.now(),
    };
    const currentList = Array.isArray(expenses) ? expenses : [];
    const updated = [newItem, ...currentList];
    setExpenses(updated);
    await StorageService.saveExpenses(updated);
  };

  const updateExpense = async (id: string, updatedFields: Partial<ExpenseItem>) => {
    const currentList = Array.isArray(expenses) ? expenses : [];
    const updated = currentList.map(e => (e.id === id ? { ...e, ...updatedFields } : e));
    setExpenses(updated);
    await StorageService.saveExpenses(updated);
  };

  const deleteExpense = async (id: string) => {
    const currentList = Array.isArray(expenses) ? expenses : [];
    const updated = currentList.filter(e => e.id !== id);
    setExpenses(updated);
    await StorageService.saveExpenses(updated);
  };

  const clearAllData = async () => {
    await StorageService.clearAll();
    await reloadExpenses();
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        categories,
        currency,
        selectedDate,
        searchQuery,
        isQuickAddOpen,
        isAiChatOpen,
        selectedExpenseForEdit,
        addExpense,
        updateExpense,
        deleteExpense,
        setCurrency,
        setSelectedDate,
        setSearchQuery,
        setIsQuickAddOpen,
        setIsAiChatOpen,
        setSelectedExpenseForEdit,
        reloadExpenses,
        clearAllData,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
