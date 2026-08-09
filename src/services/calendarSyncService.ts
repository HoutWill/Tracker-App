export interface CalendarEventPayload {
  title: string;
  notes?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm (Start Time)
  endTime?: string; // HH:mm (End Time)
  alertDate?: string; // YYYY-MM-DD (Alert Date)
  alertTime?: string; // HH:mm (Alert Time)
  category?: string;
  alarmOffsetMinutes?: number;
}

export const getGoogleCalendarUrl = (event: CalendarEventPayload): string => {
  try {
    const [year, month, day] = event.dueDate.split('-').map(Number);
    const [hour, minute] = (event.dueTime || '09:00').split(':').map(Number);
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    const startStr = `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;
    const endStr = `${year}${pad(month)}${pad(day)}T${pad(hour + 1)}${pad(minute)}00`;
    const cleanNotes = (event.notes || '').replace(/<[^>]*>/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(cleanNotes)}`;
  } catch (e) {
    return 'https://calendar.google.com';
  }
};

export const getAppleCalendarUrl = (event: CalendarEventPayload): string => {
  try {
    const [year, month, day] = event.dueDate.split('-').map(Number);
    const [hour, minute] = (event.dueTime || '09:00').split(':').map(Number);
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    const startStr = `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;
    const endStr = `${year}${pad(month)}${pad(day)}T${pad(hour + 1)}${pad(minute)}00`;
    const cleanNotes = (event.notes || '').replace(/<[^>]*>/g, '');

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PiTrack//AppleCalendar//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'TRANSP:OPAQUE',
      `UID:tracker-${Date.now()}@pitrack.app`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${cleanNotes}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'TRIGGER:-PT15M',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ];

    const icsContent = icsLines.join('\r\n');
    return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
  } catch (e) {
    return '';
  }
};

export const syncToAppleCalendar = (event: CalendarEventPayload) => {
  try {
    const dataUrl = getAppleCalendarUrl(event);
    const fileName = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (e) {
    console.error('Apple Calendar sync error:', e);
    return false;
  }
};

export const shareToAppleReminders = async (event: CalendarEventPayload): Promise<boolean> => {
  try {
    const [year, month, day] = event.dueDate.split('-').map(Number);
    const [hour, minute] = (event.dueTime || '09:00').split(':').map(Number);

    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    const dueDateObj = new Date(year, month - 1, day, hour, minute, 0);
    const dueStr = `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;

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
        title: `[PiTrack] ${event.title}`,
        files: [file],
      });
      return true;
    } else if (navigator.share) {
      const timeStr = event.dueTime ? ` at ${event.dueTime}` : '';
      const notesStr = event.notes ? `\nNotes: ${event.notes}` : '';
      await navigator.share({
        title: `[PiTrack] ${event.title}`,
        text: `[PiTrack] ${event.title}\nDue: ${event.dueDate}${timeStr}${notesStr}`,
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
