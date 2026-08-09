import React, { createContext, useContext, useState, useEffect } from 'react';
import { ReminderItem } from '../types';
import { StorageService, getTodayDateString } from '../services/storageService';
import { playAlertChime, triggerHaptic } from '../services/soundService';
import { Bell, CheckCircle2, X } from 'lucide-react';

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

  // Active In-App Alarm Popup Modal State
  const [activeAlarmReminder, setActiveAlarmReminder] = useState<ReminderItem | null>(null);

  const openAddReminderWithPreset = (preset: Partial<ReminderItem>) => {
    setPresetDraft(preset);
    setIsAddReminderOpen(true);
  };

  const [isNotificationEnabled, setIsNotificationEnabled] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  // Automatically update red badge count on Home Screen app icon whenever reminders change
  useEffect(() => {
    const activeCount = reminders.filter(r => !r.completed).length;
    if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
      if (activeCount > 0) {
        navigator.setAppBadge(activeCount).catch(() => {});
      } else {
        navigator.clearAppBadge().catch(() => {});
      }
    }
  }, [reminders]);

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setIsNotificationEnabled(granted);
      return granted;
    }
    return false;
  };

  const triggerTestNotification = async (): Promise<string> => {
    playAlertChime();
    triggerHaptic([80, 100, 80, 100]);

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
      new Notification('🔔 PiTrack Alert Test', {
        body: 'Red badge (3) set on Home Screen icon. Tap to open!',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      });
      return 'Alert sent & red badge set on Home Screen icon!';
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

    // Auto-prompt notification permission if not yet requested
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(p => {
        setIsNotificationEnabled(p === 'granted');
      });
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

  // High-Precision Real-Time Alarm Alert Engine (Runs every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const todayStr = getTodayDateString();
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const nowTimeStr = `${currentHours}:${currentMins}`; // HH:mm

      let hasStateChanges = false;
      let triggeredAlarmItem: ReminderItem | null = null;

      setReminders(prevReminders => {
        const updated = prevReminders.map(r => {
          if (r.completed || r.notifiedAt) return r;

          const targetAlertDate = r.alertDate || r.dueDate;
          const targetAlertTime = r.alertTime || r.dueTime || '09:00';

          // Trigger condition: today's date & time reached or passed
          const isDateDue = todayStr >= targetAlertDate;
          const isTimeDue = targetAlertDate < todayStr || nowTimeStr >= targetAlertTime;

          if (isDateDue && isTimeDue) {
            hasStateChanges = true;
            triggeredAlarmItem = r;
            return { ...r, notifiedAt: Date.now() };
          }
          return r;
        });

        if (hasStateChanges) {
          StorageService.saveReminders(updated);
        }
        return updated;
      });

      // Fire Alarm Actions when a scheduled reminder is due
      if (triggeredAlarmItem) {
        const item: ReminderItem = triggeredAlarmItem;

        // 1. Play Audio Alarm Chime + Double Vibration Haptics
        playAlertChime();
        triggerHaptic([100, 100, 100, 100]);

        // 2. Trigger In-App Alarm Popup Modal Banner
        setActiveAlarmReminder(item);

        // 3. Trigger OS Native Browser Notification
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            const cleanNotes = item.notes ? item.notes.replace(/<[^>]*>/g, '') : '';
            new Notification(`🔔 Alert: ${item.title}`, {
              body: `${item.dueTime || 'Scheduled'} — ${cleanNotes || item.category}`,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
            });
          } catch (e) {}
        }
      }
    }, 3000); // High precision 3s ticker

    return () => clearInterval(interval);
  }, []);

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

      {/* In-App Real-Time Alarm Popup Banner Modal */}
      {activeAlarmReminder && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '420px',
            zIndex: 99999,
            backgroundColor: '#0B131E',
            border: '1.5px solid #EC668C',
            borderRadius: '20px',
            padding: '16px',
            boxShadow: '0 10px 30px rgba(236, 102, 140, 0.4), 0 4px 14px rgba(0,0,0,0.5)',
            color: '#FFFFFF',
            animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(236, 102, 140, 0.2)', border: '1px solid #EC668C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC668C' }}>
                <Bell size={15} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#EC668C', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Reminder Due Now
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveAlarmReminder(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={16} />
            </button>
          </div>

          <h4 style={{ fontSize: '16px', fontWeight: 900, margin: '0 0 4px 0', color: '#FFFFFF', letterSpacing: '-0.2px' }}>
            {activeAlarmReminder.title}
          </h4>

          {activeAlarmReminder.notes && (
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
              {activeAlarmReminder.notes.replace(/<[^>]*>/g, '')}
            </p>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(12);
                toggleReminder(activeAlarmReminder.id);
                setActiveAlarmReminder(null);
              }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '12px',
                backgroundColor: '#30D158',
                color: '#141416',
                border: 'none',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 3px 10px rgba(48, 209, 88, 0.4)',
              }}
            >
              <CheckCircle2 size={15} />
              <span>Mark Done</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAlarmReminder(null)}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
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
