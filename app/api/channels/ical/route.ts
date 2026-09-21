import { NextRequest, NextResponse } from 'next/server';

function formatICalDate(dateStr: string): string {
  // Converts YYYY-MM-DD to YYYYMMDD
  return dateStr.replace(/-/g, '');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get('propertyId') || 'prop-1';
  const unitId = searchParams.get('unitId');
  const channel = searchParams.get('channel') || 'All';

  // Sample active reservations to block on the iCal feed
  const blockedPeriods = [
    {
      uid: `block-${propertyId}-001@onedirectory.com`,
      start: '20260922',
      end: '20260925',
      summary: 'Reserved - One Directory ERP Booking #BK-98410',
      description: 'Synchronized from One Directory PMS. Closed for arrivals/departures.',
    },
    {
      uid: `block-${propertyId}-002@onedirectory.com`,
      start: '20260927',
      end: '20260930',
      summary: 'Reserved - Direct Guest Check-in #BK-98418',
      description: 'Occupied Unit. Channel parity lock.',
    },
    {
      uid: `block-${propertyId}-003@onedirectory.com`,
      start: '20261003',
      end: '20261007',
      summary: 'Reserved - Luxury Villa Package #BK-98425',
      description: 'VIP Guest reservation.',
    },
  ];

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const eventsStr = blockedPeriods
    .map(
      (b) => `BEGIN:VEVENT
UID:${b.uid}
DTSTAMP:${nowStamp}
DTSTART;VALUE=DATE:${b.start}
DTEND;VALUE=DATE:${b.end}
SUMMARY:${b.summary}
DESCRIPTION:${b.description}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT`
    )
    .join('\r\n');

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//One Directory ERP//Hospitality Channel Manager 1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:One Directory ERP Calendar - ${propertyId} (${channel})
X-WR-TIMEZONE:Asia/Kolkata
${eventsStr}
END:VCALENDAR`;

  return new NextResponse(icsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="onedirectory-${propertyId}-${channel.toLowerCase()}.ics"`,
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
    },
  });
}
