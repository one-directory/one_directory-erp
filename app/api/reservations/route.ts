import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReservationStatus, BookingSource, UnitStatus } from '@prisma/client';

// GET /api/reservations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status') as ReservationStatus | null;
    const unitId = searchParams.get('unitId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const q = searchParams.get('q');

    const reservations = await prisma.reservation.findMany({
      where: {
        ...(propertyId && propertyId !== 'all' ? { propertyId } : {}),
        ...(status ? { status } : {}),
        ...(unitId ? { unitId } : {}),
        ...(checkIn ? { checkIn } : {}),
        ...(checkOut ? { checkOut } : {}),
        ...(q
          ? {
              OR: [
                { bookingId: { contains: q, mode: 'insensitive' } },
                { guestName: { contains: q, mode: 'insensitive' } },
                { guestPhone: { contains: q } },
                { guestEmail: { contains: q, mode: 'insensitive' } },
                { unitNumber: { contains: q } },
              ],
            }
          : {}),
      },
      include: {
        property: { select: { id: true, name: true } },
        unit: { select: { id: true, number: true, name: true, status: true } },
        guest: true,
        payments: true,
        invoices: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error: any) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reservations', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/reservations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      guestName,
      guestPhone,
      guestEmail = '',
      propertyId,
      unitId,
      checkIn,
      checkOut,
      nights = 1,
      guestsCount = 2,
      source = 'Website',
      rate = 0,
      discount = 0,
      tax = 0,
      paid = 0,
      status = 'Confirmed',
      specialRequests,
      quotationId,
      leadId,
    } = body;

    if (!guestName || !guestPhone || !propertyId || !unitId || !checkIn || !checkOut) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: guestName, guestPhone, propertyId, unitId, checkIn, checkOut are required.',
        },
        { status: 400 }
      );
    }

    const [property, unit] = await Promise.all([
      prisma.property.findUnique({ where: { id: propertyId } }),
      prisma.unit.findUnique({ where: { id: unitId }, include: { unitType: true } }),
    ]);

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
    }
    if (!unit) {
      return NextResponse.json({ success: false, error: 'Unit not found.' }, { status: 404 });
    }

    // Find or create guest
    let guest = await prisma.guest.findFirst({ where: { phone: guestPhone } });
    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          name: guestName,
          phone: guestPhone,
          email: guestEmail,
          status: 'First_time',
        },
      });
    }

    // Generate unique bookingId
    const count = await prisma.reservation.count();
    const bookingId = `OD-BKG-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const numNights = Number(nights) || 1;
    const numRate = Number(rate) || (unit.unitType?.baseRate ? unit.unitType.baseRate * numNights : 0);
    const numDiscount = Number(discount) || 0;
    const numTax = Number(tax) || Math.round((numRate - numDiscount) * 0.12);
    const total = numRate - numDiscount + numTax;
    const numPaid = Number(paid) || 0;
    const balance = total - numPaid;

    const sourceMap: Record<string, BookingSource> = {
      'Website': 'Website',
      'Walk-in': 'Walk_in',
      'Phone': 'Phone',
      'WhatsApp': 'WhatsApp',
      'Booking.com': 'Booking_com',
      'Agoda': 'Agoda',
      'Airbnb': 'Airbnb',
      'MakeMyTrip': 'MakeMyTrip',
      'Expedia': 'Expedia',
      'Other': 'Other',
    };

    const reservation = await prisma.reservation.create({
      data: {
        bookingId,
        guestId: guest.id,
        guestName,
        guestPhone,
        guestEmail,
        propertyId,
        propertyName: property.name,
        unitId,
        unitNumber: unit.number,
        unitTypeName: unit.unitTypeName,
        checkIn,
        checkOut,
        nights: numNights,
        guestsCount: Number(guestsCount) || 2,
        source: sourceMap[source] || 'Website',
        rate: numRate,
        discount: numDiscount,
        tax: numTax,
        total,
        paid: numPaid,
        balance,
        status: (status as ReservationStatus) || 'Confirmed',
        specialRequests,
        quotationId,
        leadId,
      },
      include: {
        property: true,
        unit: true,
        guest: true,
      },
    });

    // Update guest total stays and total spend
    await prisma.guest.update({
      where: { id: guest.id },
      data: {
        totalStays: { increment: 1 },
        totalSpend: { increment: total },
        lastStayDate: checkIn,
      },
    });

    // Update unit with current reservation info
    await prisma.unit.update({
      where: { id: unitId },
      data: {
        currentReservationId: reservation.id,
        currentGuestName: guestName,
        currentCheckOut: checkOut,
        status: status === 'Checked In' || status === 'Checked_In' ? 'Occupied' : unit.status,
      },
    });

    // If initial payment was made, record payment entry
    if (numPaid > 0) {
      const payCount = await prisma.payment.count();
      await prisma.payment.create({
        data: {
          paymentId: `OD-PAY-${new Date().getFullYear()}-${String(payCount + 1).padStart(5, '0')}`,
          reservationId: reservation.id,
          bookingId: reservation.bookingId,
          guestName,
          propertyId,
          propertyName: property.name,
          amount: numPaid,
          method: 'UPI',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Success',
          referenceNumber: `INIT-${reservation.bookingId}`,
          collectedBy: 'Front Desk',
        },
      });
    }

    return NextResponse.json({ success: true, data: reservation }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create reservation', details: error?.message },
      { status: 500 }
    );
  }
}
