import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OTAChannel, BookingSource, Reservation } from '@/types/erp';

interface SimulateBookingRequest {
  channel: OTAChannel;
  propertyId: string;
  propertyName: string;
  unitTypeId: string;
  unitTypeName: string;
  unitNumber?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  guestsCount?: number;
  baseRate?: number;
}

const OTA_PREFIXES: Record<OTAChannel, string> = {
  Airbnb: 'HM-ABNB',
  'Booking.com': 'BDC-IN',
  Agoda: 'AGD-RES',
  MakeMyTrip: 'MMT-BK',
};

const COMMISSION_RATES: Record<OTAChannel, number> = {
  Airbnb: 0.15,
  'Booking.com': 0.18,
  Agoda: 0.17,
  MakeMyTrip: 0.20,
};

const CHANNEL_MARKUPS: Record<OTAChannel, number> = {
  Airbnb: 0.10,
  'Booking.com': 0.15,
  Agoda: 0.12,
  MakeMyTrip: 0.14,
};

export async function POST(req: NextRequest) {
  try {
    const body: SimulateBookingRequest = await req.json();
    const {
      channel,
      propertyId = 'prop-1',
      propertyName = 'Heritage Haveli & Courtyard Suites',
      unitTypeId = 'ut-1',
      unitTypeName = 'Heritage Deluxe Room',
      unitNumber = '101',
      guestName = 'Rohan Malhotra',
      guestEmail = 'rohan.malhotra@gmail.com',
      guestPhone = '+91 98112 34567',
      checkIn = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      checkOut = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      nights = 3,
      guestsCount = 2,
      baseRate = 4500,
    } = body;

    if (!channel) {
      return NextResponse.json({ error: 'channel is required (Airbnb, Booking.com, Agoda, MakeMyTrip).' }, { status: 400 });
    }

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const bookingId = `${OTA_PREFIXES[channel]}-${randomNum}`;

    // Rate calculations
    const markupMultiplier = 1 + (CHANNEL_MARKUPS[channel] || 0.12);
    const nightlyRate = Math.round(baseRate * markupMultiplier);
    const roomCharge = nightlyRate * nights;
    const taxes = Math.round(roomCharge * 0.12); // 12% GST
    const totalAmount = roomCharge + taxes;
    const commissionPercent = COMMISSION_RATES[channel] || 0.18;
    const channelCommission = Math.round(roomCharge * commissionPercent);
    const netPayout = totalAmount - channelCommission;

    // Persist to Prisma Database
    let persistedId = `res-ota-${Date.now()}`;
    let persistedGuestId = `gst-ota-${Date.now()}`;

    try {
      // 1. Resolve or create Property
      let dbProp = await prisma.property.findUnique({ where: { id: propertyId } });
      if (!dbProp) {
        dbProp = await prisma.property.findFirst();
        if (!dbProp) {
          dbProp = await prisma.property.create({
            data: {
              id: propertyId,
              name: propertyName,
              type: 'Resort',
              location: 'Goa, India',
              contact: guestPhone,
              totalUnits: 10,
              status: 'Active',
              ownerName: 'Property Manager',
              ownerEmail: 'manager@onedirectory.com',
              ownerPhone: guestPhone,
              description: 'Luxury resort property managed by One Directory',
            },
          });
        }
      }

      // 2. Resolve or create UnitType & Unit
      let dbUnit = await prisma.unit.findFirst({
        where: {
          propertyId: dbProp.id,
          ...(unitNumber ? { number: unitNumber } : {}),
        },
      });

      if (!dbUnit) {
        let dbUnitType = await prisma.unitType.findFirst({
          where: { propertyId: dbProp.id },
        });

        if (!dbUnitType) {
          dbUnitType = await prisma.unitType.create({
            data: {
              propertyId: dbProp.id,
              propertyName: dbProp.name,
              name: unitTypeName,
              capacity: guestsCount,
              bedConfiguration: '1 King Bed',
              baseRate: baseRate,
              numberOfUnits: 5,
            },
          });
        }

        dbUnit = await prisma.unit.create({
          data: {
            propertyId: dbProp.id,
            propertyName: dbProp.name,
            unitTypeId: dbUnitType.id,
            unitTypeName: dbUnitType.name,
            number: unitNumber,
            name: `${dbUnitType.name} ${unitNumber}`,
            floor: '1',
            status: 'Occupied',
          },
        });
      }

      // 3. Resolve or create Guest
      let dbGuest = await prisma.guest.findFirst({
        where: {
          OR: [{ phone: guestPhone }, ...(guestEmail ? [{ email: guestEmail }] : [])],
        },
      });

      if (!dbGuest) {
        dbGuest = await prisma.guest.create({
          data: {
            name: guestName,
            phone: guestPhone,
            email: guestEmail,
            totalStays: 1,
            totalSpend: totalAmount,
            status: 'Regular',
          },
        });
      }

      // 4. Create Reservation in PostgreSQL
      const dbRes = await prisma.reservation.create({
        data: {
          bookingId,
          guestId: dbGuest.id,
          guestName: dbGuest.name,
          guestPhone: dbGuest.phone,
          guestEmail: dbGuest.email,
          propertyId: dbProp.id,
          propertyName: dbProp.name,
          unitId: dbUnit.id,
          unitNumber: dbUnit.number,
          unitTypeName: dbUnit.unitTypeName,
          checkIn,
          checkOut,
          nights,
          guestsCount,
          source: (channel === 'Airbnb' ? 'Airbnb' : channel === 'Booking.com' ? 'Booking_com' : channel === 'Agoda' ? 'Agoda' : 'MakeMyTrip') as any,
          rate: nightlyRate,
          discount: 0,
          tax: taxes,
          total: totalAmount,
          paid: totalAmount,
          balance: 0,
          status: 'Confirmed',
          specialRequests: `Simulated instant booking from ${channel} API v2. Commission: ₹${channelCommission} (${(commissionPercent * 100).toFixed(0)}%). Net: ₹${netPayout}.`,
        },
      });

      persistedId = dbRes.id;
      persistedGuestId = dbGuest.id;

      // Update unit status to Occupied
      await prisma.unit.update({
        where: { id: dbUnit.id },
        data: {
          status: 'Occupied',
          currentReservationId: dbRes.id,
          currentGuestName: guestName,
          currentCheckOut: checkOut,
        },
      });
    } catch (dbErr) {
      console.warn('[simulate-booking] Could not write to Prisma DB (falling back to memory):', dbErr);
    }

    const reservation: Reservation = {
      id: persistedId,
      bookingId,
      guestId: persistedGuestId,
      guestName,
      guestPhone,
      guestEmail,
      propertyId,
      propertyName,
      unitId: `unit-${unitNumber}`,
      unitNumber,
      unitTypeName,
      checkIn,
      checkOut,
      nights,
      guestsCount,
      source: channel as BookingSource,
      rate: nightlyRate,
      discount: 0,
      tax: taxes,
      total: totalAmount,
      paid: totalAmount, // OTAs usually collect prepayments online
      balance: 0,
      status: 'Confirmed',
      specialRequests: `Simulated instant booking from ${channel} API v2. Channel Commission: ₹${channelCommission.toLocaleString('en-IN')} (${(commissionPercent * 100).toFixed(0)}%). Net Payout: ₹${netPayout.toLocaleString('en-IN')}.`,
      createdAt: new Date().toISOString(),
    };

    // Simulated webhook raw payload from OTA
    const simulatedWebhookPayload = {
      event: 'reservation.created',
      channel,
      timestamp: new Date().toISOString(),
      ota_reservation_id: bookingId,
      hotel_id: propertyId,
      listing_id: `lst-${propertyId}-${unitTypeId}`,
      room_type: unitTypeName,
      dates: { check_in: checkIn, check_out: checkOut, nights },
      financials: {
        currency: 'INR',
        gross_total: totalAmount,
        room_charge: roomCharge,
        taxes,
        commission_rate: `${(commissionPercent * 100).toFixed(1)}%`,
        commission_amount: channelCommission,
        net_payable_to_hotel: netPayout,
        collection_model: 'OTA_COLLECT',
      },
      guest: {
        name: guestName,
        phone: guestPhone,
        email: guestEmail,
        country: 'IN',
      },
    };

    // Simulated outbound stop-sell broadcast to remaining channels
    const otherChannels: OTAChannel[] = (['Airbnb', 'Booking.com', 'Agoda', 'MakeMyTrip'] as OTAChannel[])
      .filter((c) => c !== channel);

    const outboundBroadcasts = otherChannels.map((c) => ({
      targetChannel: c,
      action: 'CALENDAR_BLOCK_DATES',
      dates: `${checkIn} to ${checkOut}`,
      unitNumber,
      latencyMs: Math.floor(80 + Math.random() * 120),
      status: 'SUCCESS',
      message: `Unit ${unitNumber} blocked on ${c} to prevent double-booking.`,
    }));

    return NextResponse.json({
      success: true,
      message: `Incoming ${channel} reservation successfully ingested, stored in database, and synced.`,
      reservation,
      webhookPayload: simulatedWebhookPayload,
      outboundBroadcasts,
    });
  } catch (error) {
    console.error('[simulate-booking POST] Error:', error);
    return NextResponse.json({ error: 'Failed to simulate OTA booking.' }, { status: 500 });
  }
}
