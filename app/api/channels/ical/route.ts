import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatICalDate(dateStr: string): string {
  // Converts YYYY-MM-DD to YYYYMMDD
  return dateStr.replace(/-/g, '');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');
    const unitId = searchParams.get('unitId');
    const channel = searchParams.get('channel') || 'All';

    const whereClause: any = {
      status: { in: ['Confirmed', 'Checked_In', 'In_House'] },
    };

    if (propertyId && propertyId !== 'all') {
      whereClause.propertyId = propertyId;
    }
    if (unitId && unitId !== 'all') {
      whereClause.unitId = unitId;
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      select: {
        id: true,
        bookingId: true,
        checkIn: true,
        checkOut: true,
        guestName: true,
        source: true,
        propertyId: true,
        unitId: true,
      },
      orderBy: { checkIn: 'asc' },
    });

    const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const eventsStr = reservations
      .map((r) => {
        const start = formatICalDate(r.checkIn);
        const end = formatICalDate(r.checkOut);
        const uid = `res-${r.id}@onedirectory.com`;
        const summary = `Reserved - ${r.guestName} (#${r.bookingId})`;
        const description = `Source: ${r.source}. Synced from One Directory PMS.`;

        return `BEGIN:VEVENT\r\nUID:${uid}\r\nDTSTAMP:${nowStamp}\r\nDTSTART;VALUE=DATE:${start}\r\nDTEND;VALUE=DATE:${end}\r\nSUMMARY:${summary}\r\nDESCRIPTION:${description}\r\nSTATUS:CONFIRMED\r\nTRANSP:OPAQUE\r\nEND:VEVENT`;
      })
      .join('\r\n');

    const calName =
      propertyId && propertyId !== 'all'
        ? `One Directory ERP Calendar - ${propertyId} (${channel})`
        : `One Directory ERP Calendar - All Properties (${channel})`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//One Directory ERP//Hospitality Channel Manager 1.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${calName}`,
      'X-WR-TIMEZONE:Asia/Kolkata',
      eventsStr ? eventsStr : '',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n');

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `inline; filename="onedirectory-${propertyId || 'all'}-${channel.toLowerCase()}.ics"`,
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error generating iCal feed:', error);
    return new NextResponse('Error generating iCal feed', { status: 500 });
  }
}
