/**
 * Cloudflare Pages Function: /api/ics
 * Serves native iCal (.ics) files over HTTP with proper text/calendar MIME headers
 * so iOS Safari natively opens Apple Reminders / Apple Calendar without download errors!
 */

export async function onRequest(context: { request: Request }) {
  try {
    const url = new URL(context.request.url);
    const title = url.searchParams.get('title') || 'Reminder';
    const notes = url.searchParams.get('notes') || '';
    const date = url.searchParams.get('date') || '';
    const time = url.searchParams.get('time') || '09:00';
    const type = url.searchParams.get('type') || 'event'; // 'event' or 'todo'

    if (!date) {
      return new Response('Missing date parameter', { status: 400 });
    }

    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    const startStr = `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;

    const now = new Date();
    const stampStr = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

    let icsContent = '';

    if (type === 'todo') {
      icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Apple Inc.//iOS//EN',
        'CALSCALE:GREGORIAN',
        'BEGIN:VTODO',
        `UID:tracker-reminder-${Date.now()}@tracker.app`,
        `DTSTAMP:${stampStr}`,
        `DUE:${startStr}`,
        `SUMMARY:🔔 ${title}`,
        `DESCRIPTION:${notes || 'Reminder from Tracker App'}`,
        'PRIORITY:1',
        'STATUS:NEEDS-ACTION',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:Due Alert: ${title}`,
        'TRIGGER:-PT0M',
        'END:VALARM',
        'BEGIN:VALARM',
        'ACTION:AUDIO',
        'TRIGGER:-PT0M',
        'ATTACH;VALUE=URI:Basso',
        'END:VALARM',
        'END:VTODO',
        'END:VCALENDAR',
      ].join('\r\n');
    } else {
      const endMinutes = (minute + 30) % 60;
      const endHours = hour + Math.floor((minute + 30) / 60);
      const endStr = `${year}${pad(month)}${pad(day)}T${pad(endHours)}${pad(endMinutes)}00`;

      icsContent = [
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
        `SUMMARY:🔔 ${title}`,
        `DESCRIPTION:${notes || 'Scheduled reminder from Tracker App'}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:Due Alert: ${title}`,
        'TRIGGER:-PT0M',
        'END:VALARM',
        'BEGIN:VALARM',
        'ACTION:AUDIO',
        'TRIGGER:-PT0M',
        'ATTACH;VALUE=URI:Basso',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');
    }

    const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;

    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (e: any) {
    return new Response('Server error generating calendar file: ' + e.message, { status: 500 });
  }
}
