/**
 * RFC 5545 iCalendar Parser for OTA Channel Calendars (Airbnb, Booking.com, Agoda, VRBO, etc.)
 */

export interface ParsedICalEvent {
  uid: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  summary: string;
  description?: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'TENTATIVE';
  created?: string;
  lastModified?: string;
}

/**
 * Parses raw iCalendar text (RFC 5545) into structured events
 */
export function parseICalendar(icsContent: string): ParsedICalEvent[] {
  if (!icsContent || typeof icsContent !== 'string') return [];

  // 1. Unfold lines according to RFC 5545 (a newline followed by whitespace is a continuation)
  const unfolded = icsContent.replace(/\r?\n[ \t]/g, '');
  const lines = unfolded.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const events: ParsedICalEvent[] = [];
  let currentEvent: Partial<ParsedICalEvent> | null = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {
        status: 'CONFIRMED',
      };
      continue;
    }

    if (line === 'END:VEVENT') {
      if (currentEvent && currentEvent.uid && currentEvent.startDate && currentEvent.endDate) {
        events.push({
          uid: currentEvent.uid,
          startDate: currentEvent.startDate,
          endDate: currentEvent.endDate,
          summary: currentEvent.summary || 'Reserved (External OTA)',
          description: currentEvent.description,
          status: currentEvent.status || 'CONFIRMED',
          created: currentEvent.created,
          lastModified: currentEvent.lastModified,
        });
      }
      currentEvent = null;
      continue;
    }

    if (!currentEvent) continue;

    // Parse property and value
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const propHeader = line.substring(0, colonIdx);
    const value = line.substring(colonIdx + 1).trim();

    // Property name without parameters (e.g., DTSTART;VALUE=DATE -> DTSTART)
    const propName = propHeader.split(';')[0].toUpperCase();

    switch (propName) {
      case 'UID':
        currentEvent.uid = value;
        break;

      case 'SUMMARY':
        currentEvent.summary = value.replace(/\\,/g, ',').replace(/\\n/g, ' ');
        break;

      case 'DESCRIPTION':
        currentEvent.description = value.replace(/\\,/g, ',').replace(/\\n/g, '\n');
        break;

      case 'STATUS': {
        const valUpper = value.toUpperCase();
        if (valUpper.includes('CANCEL')) {
          currentEvent.status = 'CANCELLED';
        } else if (valUpper.includes('TENTATIVE')) {
          currentEvent.status = 'TENTATIVE';
        } else {
          currentEvent.status = 'CONFIRMED';
        }
        break;
      }

      case 'DTSTART':
        currentEvent.startDate = parseICalDateValue(value);
        break;

      case 'DTEND':
        currentEvent.endDate = parseICalDateValue(value);
        break;

      case 'CREATED':
        currentEvent.created = parseICalDateValue(value);
        break;

      case 'LAST-MODIFIED':
        currentEvent.lastModified = parseICalDateValue(value);
        break;
    }
  }

  return events;
}

/**
 * Converts various iCalendar date formats into YYYY-MM-DD
 * Examples:
 *  - 20261015 -> 2026-10-15
 *  - 20261015T143000Z -> 2026-10-15
 *  - 2026-10-15 -> 2026-10-15
 */
export function parseICalDateValue(rawVal: string): string {
  if (!rawVal) return '';

  // Clean parameters or quotes
  const val = rawVal.replace(/[^0-9T-]/g, '').trim();

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
    return val.substring(0, 10);
  }

  // If YYYYMMDD or YYYYMMDDTHHMMSS...
  if (val.length >= 8 && /^\d{8}/.test(val)) {
    const y = val.substring(0, 4);
    const m = val.substring(4, 6);
    const d = val.substring(6, 8);
    return `${y}-${m}-${d}`;
  }

  // Fallback to JS Date parse
  try {
    const d = new Date(rawVal);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {
    // ignore
  }

  return rawVal;
}
