/**
 * Apple Calendar (.ics) & System Alarm Sync Service
 * Generates native iCal (.ics) event files with built-in VALARM triggers
 * so scheduled reminders sync directly into Apple Calendar & iPhone Lock Screen Alarms!
 */

export interface CalendarEventPayload {
  title: string;
  notes?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  category?: string;
  alarmOffsetMinutes?: number; // 0 = exact time, 15 = 15m before, 30 = 30m before
}

export const syncToAppleCalendar = (event: CalendarEventPayload) => {
  try {
    const [year, month, day] = event.dueDate.split('-').map(Number);
    const [hour, minute] = (event.dueTime || '09:00').split(':').map(Number);

    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

    // Create Start & End Date objects
    const startDate = new Date(year, month - 1, day, hour, minute, 0);
    const endDate = new Date(startDate.getTime() + 15 * 60 * 1000); // 15-minute event slot

    const startStr = `${startDate.getFullYear()}${pad(startDate.getMonth() + 1)}${pad(startDate.getDate())}T${pad(startDate.getHours())}${pad(startDate.getMinutes())}00`;
    const endStr = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

    const now = new Date();
    const stampStr = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

    const offset = event.alarmOffsetMinutes || 0;
    const triggerStr = offset === 0 ? '-PT0M' : `-PT${offset}M`;

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Tracker App//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:tracker-event-${Date.now()}@tracker.app`,
      `DTSTAMP:${stampStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:🔔 ${event.title}`,
      `DESCRIPTION:${event.notes || 'Scheduled reminder from Tracker App'}`,
      'BEGIN:VALARM',
      `TRIGGER:${triggerStr}`, // Single exact alarm at exact user-selected time!
      'ACTION:DISPLAY',
      `DESCRIPTION:Due Alert: ${event.title}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ];

    const icsContent = icsLines.join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  } catch (e) {
    console.error('Calendar sync error:', e);
    return false;
  }
};
