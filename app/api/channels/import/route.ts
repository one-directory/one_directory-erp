import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseICalendar, ParsedICalEvent } from '@/lib/ical-parser';
import { BookingSource } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, unitId, channel, iCalUrl, icsData } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId is required for calendar import.' },
        { status: 400 }
      );
    }

    let icsContent = icsData;

    // 1. If iCalUrl is provided, fetch external feed
    if (iCalUrl && typeof iCalUrl === 'string') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const fetchRes = await fetch(iCalUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'OneDirectoryERP-CalendarSync/1.0',
            Accept: 'text/calendar, text/plain, */*',
          },
        });
        clearTimeout(timeoutId);

        if (!fetchRes.ok) {
          return NextResponse.json(
            { error: `External calendar feed returned HTTP ${fetchRes.status}: ${fetchRes.statusText}` },
            { status: 502 }
          );
        }

        icsContent = await fetchRes.text();
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return NextResponse.json(
            { error: 'Connection timed out while fetching external iCal feed (10s limit).' },
            { status: 504 }
          );
        }
        return NextResponse.json(
          { error: `Failed to fetch external iCal feed: ${err.message}` },
          { status: 502 }
        );
      }
    }

    if (!icsContent || typeof icsContent !== 'string') {
      return NextResponse.json(
        { error: 'Either valid iCalUrl or raw icsData is required.' },
        { status: 400 }
      );
    }

    // 2. Parse RFC 5545 iCalendar events
    const parsedEvents: ParsedICalEvent[] = parseICalendar(icsContent);

    if (parsedEvents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No calendar events found in the provided iCal feed.',
        totalEventsFound: 0,
        importedCount: 0,
        events: [],
      });
    }

    // 3. Resolve property & unit details
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { units: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found.' }, { status: 404 });
    }

    // Determine target unit
    let targetUnit = unitId
      ? property.units.find((u) => u.id === unitId)
      : property.units[0];

    // Map source channel
    let bookingSource: BookingSource = BookingSource.Other;
    const channelLower = (channel || '').toLowerCase();
    if (channelLower.includes('airbnb')) bookingSource = BookingSource.Airbnb;
    else if (channelLower.includes('booking')) bookingSource = BookingSource.Booking_com;
    else if (channelLower.includes('agoda')) bookingSource = BookingSource.Agoda;
    else if (channelLower.includes('makemytrip') || channelLower.includes('mmt')) bookingSource = BookingSource.MakeMyTrip;
    else if (channelLower.includes('expedia')) bookingSource = BookingSource.Expedia;

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const evt of parsedEvents) {
      const uidSignature = `[iCal-UID:${evt.uid}]`;

      // Check if this external UID is already saved
      const existing = await prisma.reservation.findFirst({
        where: {
          propertyId,
          notes: { contains: uidSignature },
        } as any,
      });

      if (existing) {
        if (evt.status === 'CANCELLED') {
          await prisma.reservation.update({
            where: { id: existing.id },
            data: { status: 'Cancelled' },
          });
          updatedCount++;
        } else {
          // Update dates if changed
          await prisma.reservation.update({
            where: { id: existing.id },
            data: {
              checkIn: evt.startDate,
              checkOut: evt.endDate,
              status: existing.status === 'Cancelled' ? 'Confirmed' : existing.status,
            },
          });
          updatedCount++;
        }
      } else {
        if (evt.status === 'CANCELLED') {
          skippedCount++;
          continue;
        }

        // Calculate nights
        const start = new Date(evt.startDate);
        const end = new Date(evt.endDate);
        const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

        const bookingId = `OTA-${(channel || 'CAL').substring(0, 4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const guestName = evt.summary || `${channel || 'OTA'} Guest`;

        // Create or reuse a placeholder guest record (required relation)
        let guestRecord = await prisma.guest.findFirst({
          where: { name: guestName, email: '' },
        });
        if (!guestRecord) {
          guestRecord = await prisma.guest.create({
            data: { name: guestName, email: '', phone: '' },
          });
        }

        // Resolve unit — required relation in schema
        const resolvedUnit = targetUnit ?? property.units[0];
        if (!resolvedUnit) {
          skippedCount++;
          continue; // Can't create reservation without a unit
        }

        await prisma.reservation.create({
          data: {
            bookingId,
            guestId: guestRecord.id,
            guestName,
            guestEmail: '',
            guestPhone: '',
            propertyId,
            propertyName: property.name,
            unitId: resolvedUnit.id,
            unitNumber: resolvedUnit.number,
            unitTypeName: resolvedUnit.name,
            checkIn: evt.startDate,
            checkOut: evt.endDate,
            nights,
            guestsCount: 2,
            source: bookingSource,
            rate: 0,
            total: 0,
            paid: 0,
            balance: 0,
            specialRequests: `Synced via external ${channel || 'OTA'} iCal feed. ${uidSignature}\nSummary: ${evt.summary}\n${evt.description || ''}`,
          },
        });
        createdCount++;
      }
    }

    // 4. Log Audit Trail entry in database
    try {
      const now = new Date();
      await prisma.auditLog.create({
        data: {
          date: now.toISOString().split('T')[0],
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          user: 'Channel Manager Engine',
          action: 'iCal External Sync',
          module: 'Channels',
          recordId: propertyId,
          details: `Synced ${parsedEvents.length} calendar events from ${channel || 'OTA'}. Created ${createdCount} reservations, updated ${updatedCount}.`,
        },
      });
    } catch {
      // ignore audit log non-critical fail
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${parsedEvents.length} external calendar events.`,
      channel: channel || 'External Feed',
      property: property.name,
      totalEventsFound: parsedEvents.length,
      createdCount,
      updatedCount,
      skippedCount,
      events: parsedEvents,
    });
  } catch (error: any) {
    console.error('[channels/import POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process external calendar import.', details: error?.message },
      { status: 500 }
    );
  }
}
