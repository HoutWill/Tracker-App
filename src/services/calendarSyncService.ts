/**
 * Apple Calendar (.ics) & System Alarm Sync Service
 * Generates native iCal (.ics) event files with built-in VALARM triggers
 * so scheduled reminders sync directly into Apple Calendar & iPhone Lock Screen Alarms!
 */

export interface CalendarEventPayload {
  title: string;
  notes?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm (Start Time)
  endTime?: string; // HH:mm (End Time)
  category?: string;
  alarmOffsetMinutes?: number; // 0 = exact time, 15 = 15m before, 30 = 30m before
}

export const syncToAppleCalendar = (event: CalendarEventPayload) => {
  try {
    const params = new URLSearchParams({
      title: event.title,
      notes: event.notes || '',
      date: event.dueDate,
      time: event.dueTime || '09:00',
      type: 'event',
    });

    const httpUrl = `/api/ics?${params.toString()}`;
    window.location.href = httpUrl;
    return true;
  } catch (e) {
    console.error('Calendar sync error:', e);
    return false;
  }
};

export const syncToAppleReminders = (event: CalendarEventPayload) => {
  try {
    const params = new URLSearchParams({
      title: event.title,
      notes: event.notes || '',
      date: event.dueDate,
      time: event.dueTime || '09:00',
      type: 'todo',
    });

    const httpUrl = `/api/ics?${params.toString()}`;
    window.location.href = httpUrl;
    return true;
  } catch (e) {
    console.error('Apple Reminders sync error:', e);
    return false;
  }
};
