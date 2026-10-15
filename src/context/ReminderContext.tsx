import React, { createContext, useContext, useState, useEffect } from 'react';
import { ReminderItem } from '../types';
import { StorageService, getTodayDateString, getNowTimeString, getReminderDueTimestamp } from '../services/storageService';
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

  // Active In-App Alarm Popup Queue
  const [activeAlarmQueue, setActiveAlarmQueue] = useState<ReminderItem[]>([]);
  const activeAlarmReminder = activeAlarmQueue[0] || null;

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

  const showNativeNotification = async (item: ReminderItem | { title: string; body?: string }) => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const cleanTitle = item.title;
    const bodyText = (item as any).body !== undefined
      ? (item as any).body
      : `${(item as ReminderItem).dueTime || 'Scheduled'} - ${((item as ReminderItem).notes || '').replace(/<[^>]*>/g, '') || (item as ReminderItem).category || 'Task'}`;

    const options: any = {
      body: bodyText,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      tag: `pitrack-${(item as any).id || Date.now()}`,
    };

    // 1. Try Service Worker showNotification first (Required for iOS PWAs and background tabs)
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(cleanTitle, options);
          return;
        }
      }
    } catch (e) {}

    // 2. Fallback to standard constructor
    try {
      new Notification(cleanTitle, options);
    } catch (e) {}
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

    await showNativeNotification({
      title: 'PiTrack Alert Test',
      body: 'Red badge (3) set on Home Screen icon. Tap to open!',
    });

    return 'Alert sent & red badge set on Home Screen icon!';
  };

  const addReminder = (item: Omit<ReminderItem, 'id' | 'createdAt' | 'completed'>) => {
    const cleanTitle = (item.title || '').trim();
    if (!cleanTitle) {
      console.warn('Empty reminder title rejected');
      return;
    }

    const newReminder: ReminderItem = {
      ...item,
      title: cleanTitle.slice(0, 150),
      id: 'rem-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
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
    if (!id || typeof id !== 'string') return;
    const cleanId = id.trim();
    const updated = reminders.map(r => {
      if (r.id !== cleanId) return r;
      const nextCompleted = !r.completed;
      return {
        ...r,
        completed: nextCompleted,
        completedAt: nextCompleted ? Date.now() : undefined,
        // Reset notifiedAt when uncompleting so user can be reminded again if rescheduled or active
        notifiedAt: nextCompleted ? r.notifiedAt : undefined,
      };
    });
    setReminders(updated);
    StorageService.saveReminders(updated);
  };

  const updateReminder = (id: string, fields: Partial<ReminderItem>) => {
    if (!id || typeof id !== 'string') return;
    const cleanId = id.trim();

    if (fields.title !== undefined) {
      const cleanTitle = fields.title.trim();
      if (!cleanTitle) return;
      fields.title = cleanTitle.slice(0, 150);
    }

    // If date or time is rescheduled, reset notifiedAt unless explicitly specified
    const isRescheduled = fields.dueDate !== undefined || fields.dueTime !== undefined || fields.alertDate !== undefined || fields.alertTime !== undefined;

    const updated = reminders.map(r => {
      if (r.id !== cleanId) return r;
      const nextNotifiedAt = fields.notifiedAt !== undefined
        ? fields.notifiedAt
        : isRescheduled
          ? undefined
          : r.notifiedAt;
      return {
        ...r,
        ...fields,
        notifiedAt: nextNotifiedAt,
      };
    });
    setReminders(updated);
    StorageService.saveReminders(updated);
  };

  const deleteReminder = (id: string) => {
    if (!id || typeof id !== 'string') return;
    const cleanId = id.trim();
    const updated = reminders.filter(r => r.id !== cleanId);
    setReminders(updated);
    StorageService.saveReminders(updated);
    setActiveAlarmQueue(prev => prev.filter(r => r.id !== cleanId));
  };

  // High-Precision Real-Time Alarm Alert Engine (Every 2s + visibility/focus instant check)
  useEffect(() => {
    const checkDueReminders = () => {
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      let hasStateChanges = false;
      const dueToAlert: ReminderItem[] = [];

      setReminders(prevReminders => {
        const updated = prevReminders.map(r => {
          if (r.completed || r.notifiedAt) return r;
          if (r.alertEnabled === false) return r;

          const dueTimestamp = getReminderDueTimestamp(r);
          if (isNaN(dueTimestamp)) return r;

          // Check if scheduled Cambodia time has arrived or passed
          if (now >= dueTimestamp) {
            hasStateChanges = true;
            // Only trigger loud sound/popup if due recently (within 24 hours), to prevent ancient historical task spam
            if (now - dueTimestamp <= oneDayMs) {
              dueToAlert.push(r);
            }
            return { ...r, notifiedAt: now };
          }

          return r;
        });

        if (hasStateChanges) {
          StorageService.saveReminders(updated);
        }
        return updated;
      });

      if (dueToAlert.length > 0) {
        // 1. Play Audio Chime & Haptic
        playAlertChime();
        triggerHaptic([100, 100, 100, 100]);

        // 2. Trigger native Notification for each due item
        dueToAlert.forEach(item => {
          showNativeNotification(item);
        });

        // 3. Queue in-app alarm popup banners without dropping any items
        setActiveAlarmQueue(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = dueToAlert.filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      }
    };

    // Run check immediately on mount
    checkDueReminders();

    // 2-second interval
    const interval = setInterval(checkDueReminders, 2000);

    // Immediate check when screen turns on or user switches back to app tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkDueReminders();
      }
    };
    const handleFocus = () => {
      checkDueReminders();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
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
                Alert
              </span>
              {activeAlarmQueue.length > 1 && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(236, 102, 140, 0.25)',
                    color: '#EC668C',
                  }}
                >
                  ({activeAlarmQueue.length})
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveAlarmQueue(prev => prev.filter(r => r.id !== activeAlarmReminder.id))}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              title="Close"
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
                setActiveAlarmQueue(prev => prev.filter(r => r.id !== activeAlarmReminder.id));
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
              <span>Done</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAlarmQueue(prev => prev.filter(r => r.id !== activeAlarmReminder.id))}
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
