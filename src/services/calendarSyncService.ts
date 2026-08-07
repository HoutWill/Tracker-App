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
}

export const syncToAppleCalendar = (event: CalendarEventPayload) => {
  try {
    const [year, month, day] = event.dueDate.split('-').map(Number);
    const [hour, minute] = (event.dueTime || '09:00').split(':').map(Number);

    // Format UTC ISO timestamp strings without punctuation (YYYYMMDDTHHMMSSZ)
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    const startStr = `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00Z`;

    // 30 minute event duration
    const endMinutes = (minute + 30) % 60;
    const endHours = hour + Math.floor((minute + 30) / 60);
    const endStr = `${year}${pad(month)}${pad(day)}T${pad(endHours)}${pad(endMinutes)}00Z`;

    const now = new Date();
    const stampStr = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

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
      'TRIGGER:-PT0M', // Alarm right at exact due time!
      'ACTION:DISPLAY',
      `DESCRIPTION:Due Alert: ${event.title}`,
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M', // Second alarm 15 minutes before!
      'ACTION:DISPLAY',
      `DESCRIPTION:Upcoming Alert (15m): ${event.title}`,
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
