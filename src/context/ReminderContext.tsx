import React, { createContext, useContext, useState, useEffect } from 'react';
import { ReminderItem } from '../types';
import { StorageService, getTodayDateString } from '../services/storageService';

interface ReminderContextType {
  reminders: ReminderItem[];
  isAddReminderOpen: boolean;
  setIsAddReminderOpen: (open: boolean) => void;
  presetDraft: Partial<ReminderItem> | null;
  setPresetDraft: (draft: Partial<ReminderItem> | null) => void;
  openAddReminderWithPreset: (preset: Partial<ReminderItem>) => void;
  addReminder: (item: Omit<ReminderItem, 'id' | 'createdAt' | 'completed'>) => void;
  toggleReminder: (id: string) => void;
  updateReminder: (id: string, fields: Partial<ReminderItem>) => void;
  deleteReminder: (id: string) => void;
  isNotificationEnabled: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  triggerTestNotification: () => Promise<string>;
}

const ReminderContext = createContext<ReminderContextType>({} as ReminderContextType);

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reminders, setReminders] = useState<ReminderItem[]>(() => StorageService.getReminders());
  const [isAddReminderOpen, setIsAddReminderOpen] = useState<boolean>(false);
  const [presetDraft, setPresetDraft] = useState<Partial<ReminderItem> | null>(null);

  const openAddReminderWithPreset = (preset: Partial<ReminderItem>) => {
    setPresetDraft(preset);
    setIsAddReminderOpen(true);
  };
  const [isNotificationEnabled, setIsNotificationEnabled] = useState<boolean>(() => {
    return 'Notification' in window && Notification.permission === 'granted';
  });

  // Automatically update red badge count on Home Screen app icon whenever reminders change
  useEffect(() => {
    const activeCount = reminders.filter(r => !r.completed).length;
    if ('setAppBadge' in navigator) {
      if (activeCount > 0) {
        navigator.setAppBadge(activeCount).catch(() => {});
      } else {
        navigator.clearAppBadge().catch(() => {});
      }
    }
  }, [reminders]);

  const requestNotificationPermission = async (): Promise<boolean> => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setIsNotificationEnabled(granted);
      return granted;
    }
    return false;
  };

  const triggerTestNotification = async (): Promise<string> => {
    if (!('Notification' in window)) {
      return 'Notifications API is not supported on this browser context.';
    }

    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
      setIsNotificationEnabled(permission === 'granted');
    }

    if (permission !== 'granted') {
      return 'Notification permission denied by device settings.';
    }

    // Set red badge (3) on Home Screen app icon
    if ('setAppBadge' in navigator) {
      try {
        await navigator.setAppBadge(3);
      } catch (e) {}
    }

    try {
      new Notification('🔔 Tracker Alert Test', {
        body: 'Red badge (3) set on Home Screen icon. Tap to open!',
        icon: '/assets/icon-192.png',
        badge: '/assets/icon-192.png',
      });
      return 'Alert sent & red badge (3) set on Home Screen icon!';
    } catch (e: any) {
      return 'Alert triggered! Check Home Screen icon badge.';
    }
  };

  const addReminder = (item: Omit<ReminderItem, 'id' | 'createdAt' | 'completed'>) => {
    const newReminder: ReminderItem = {
      ...item,
      id: 'rem-' + Date.now(),
      completed: false,
      createdAt: Date.now(),
    };
    const updated = [newReminder, ...reminders];
    setReminders(updated);
    StorageService.saveReminders(updated);

    // If notifications enabled, trigger feedback test
    if (newReminder.alertEnabled && isNotificationEnabled && 'Notification' in window) {
      try {
        new Notification(`Reminder set: ${newReminder.title}`, {
          body: `Scheduled for ${newReminder.dueDate} ${newReminder.dueTime || ''}`,
          icon: '/assets/icon-192.png',
        });
      } catch (e) {}
    }
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map(r => (r.id === id ? { ...r, completed: !r.completed } : r));
    setReminders(updated);
    StorageService.saveReminders(updated);
  };

  const updateReminder = (id: string, fields: Partial<ReminderItem>) => {
    const updated = reminders.map(r => (r.id === id ? { ...r, ...fields } : r));
    setReminders(updated);
    StorageService.saveReminders(updated);
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    StorageService.saveReminders(updated);
  };

  // Background reminder checker to trigger browser notifications when reminders are due
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isNotificationEnabled || !('Notification' in window)) return;
      const today = getTodayDateString();
      const nowTime = new Date().toTimeString().slice(0, 5); // HH:mm

      reminders.forEach(r => {
        if (!r.completed && r.alertEnabled && r.dueDate === today && r.dueTime === nowTime) {
          try {
            new Notification(`Due Alert: ${r.title}`, {
              body: `Reminder for ${r.category} is due right now!`,
              icon: '/assets/icon-192.png',
            });
          } catch (e) {}
        }
      });
    }, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [reminders, isNotificationEnabled]);

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        isAddReminderOpen,
        setIsAddReminderOpen,
        presetDraft,
        setPresetDraft,
        openAddReminderWithPreset,
        addReminder,
        toggleReminder,
        updateReminder,
        deleteReminder,
        isNotificationEnabled,
        requestNotificationPermission,
        triggerTestNotification,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
};
