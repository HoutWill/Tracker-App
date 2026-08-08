export interface CalendarEventPayload {
  title: string;
  notes?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  endTime?: string; // HH:mm
  category?: string;
  alarmOffsetMinutes?: number; // 0 = exact time, 15 = 15m before, 30 = 30m before
}

export const syncToAppleCalendar = (event: CalendarEventPayload) => {
  try {
    const [year, month, day] = event.dueDate.split('-').map(Number);
    const [hour, minute] = (event.dueTime || '09:00').split(':').map(Number);

    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

    const startDate = new Date(year, month - 1, day, hour, minute, 0);
    
    let endDate: Date;
    if (event.endTime) {
      const [endHour, endMinute] = event.endTime.split(':').map(Number);
      endDate = new Date(year, month - 1, day, endHour, endMinute, 0);
    } else {
      endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
    }

    const startStr = `${startDate.getFullYear()}${pad(startDate.getMonth() + 1)}${pad(startDate.getDate())}T${pad(startDate.getHours())}${pad(startDate.getMinutes())}00`;
    const endStr = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

    const now = new Date();
    const stampStr = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

    const offset = event.alarmOffsetMinutes || 0;
    const triggerStr = offset === 0 ? '-PT0M' : `-PT${offset}M`;

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Apple Inc.//Mac OS X 10.15//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'TRANSP:OPAQUE',
      `UID:tracker-event-${Date.now()}@tracker.app`,
      `DTSTAMP:${stampStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:[PiTrack] ${event.title}`,
      `DESCRIPTION:${event.notes || 'Scheduled reminder from Tracker App'}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Due Alert: ${event.title}`,
      `TRIGGER:${triggerStr}`,
      'END:VALARM',
      'BEGIN:VALARM',
      'ACTION:AUDIO',
      `TRIGGER:${triggerStr}`,
      'ATTACH;VALUE=URI:Basso',
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

export const shareToAppleReminders = async (event: CalendarEventPayload): Promise<boolean> => {
  try {
    const [year, month, day] = event.dueDate.split('-').map(Number);
    const [hour, minute] = (event.dueTime || '09:00').split(':').map(Number);

    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    const dueDateObj = new Date(year, month - 1, day, hour, minute, 0);
    const dueStr = `${dueDateObj.getFullYear()}${pad(dueDateObj.getMonth() + 1)}${pad(dueDateObj.getDate())}T${pad(dueDateObj.getHours())}${pad(dueDateObj.getMinutes())}00`;

    const now = new Date();
    const stampStr = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Apple Inc.//iOS//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VTODO',
      `UID:tracker-reminder-${Date.now()}@tracker.app`,
      `DTSTAMP:${stampStr}`,
      `DUE:${dueStr}`,
      `SUMMARY:[PiTrack] ${event.title}`,
      `DESCRIPTION:${event.notes || 'Reminder from Tracker App'}`,
      'PRIORITY:1',
      'STATUS:NEEDS-ACTION',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Due Alert: ${event.title}`,
      'TRIGGER:-PT0M',
      'END:VALARM',
      'END:VTODO',
      'END:VCALENDAR',
    ];

    const icsContent = icsLines.join('\r\n');
    const fileName = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_reminder.ics`;
    const file = new File([icsContent], fileName, { type: 'text/calendar' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: event.title,
        text: `Reminder: ${event.title}`,
        files: [file],
      });
      return true;
    } else if (navigator.share) {
      await navigator.share({
        title: event.title,
        text: `[PiTrack] Reminder: ${event.title}\nDate: ${event.dueDate} ${event.dueTime || ''}\n${event.notes || ''}`,
      });
      return true;
    } else {
      return syncToAppleCalendar(event);
    }
  } catch (e) {
    console.error('Share to Reminders error:', e);
    return false;
  }
};

export const syncToAppleReminders = (event: CalendarEventPayload) => {
  try {
    const [year, month, day] = event.dueDate.split('-').map(Number);
    const [hour, minute] = (event.dueTime || '09:00').split(':').map(Number);

    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    const dueDateObj = new Date(year, month - 1, day, hour, minute, 0);
    const dueStr = `${dueDateObj.getFullYear()}${pad(dueDateObj.getMonth() + 1)}${pad(dueDateObj.getDate())}T${pad(dueDateObj.getHours())}${pad(dueDateObj.getMinutes())}00`;

    const now = new Date();
    const stampStr = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

    const offset = event.alarmOffsetMinutes || 0;
    const triggerStr = offset === 0 ? '-PT0M' : `-PT${offset}M`;

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Apple Inc.//iOS//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VTODO',
      `UID:tracker-reminder-${Date.now()}@tracker.app`,
      `DTSTAMP:${stampStr}`,
      `DUE:${dueStr}`,
      `SUMMARY:[PiTrack] ${event.title}`,
      `DESCRIPTION:${event.notes || 'Reminder from Tracker App'}`,
      'PRIORITY:1',
      'STATUS:NEEDS-ACTION',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Due Alert: ${event.title}`,
      `TRIGGER:${triggerStr}`,
      'END:VALARM',
      'BEGIN:VALARM',
      'ACTION:AUDIO',
      `TRIGGER:${triggerStr}`,
      'ATTACH;VALUE=URI:Basso',
      'END:VALARM',
      'END:VTODO',
      'END:VCALENDAR',
    ];

    const icsContent = icsLines.join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_reminder.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  } catch (e) {
    console.error('Apple Reminders sync error:', e);
    return false;
  }
};
