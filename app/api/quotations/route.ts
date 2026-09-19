import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/quotations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const leadId = searchParams.get('leadId');
    const status = searchParams.get('status');

    const quotations = await prisma.quotation.findMany({
      where: {
        ...(propertyId && propertyId !== 'all' ? { propertyId } : {}),
        ...(leadId ? { leadId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        property: { select: { id: true, name: true } },
        lead: { select: { id: true, leadNumber: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, count: quotations.length, data: quotations });
  } catch (error: any) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotations', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/quotations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      leadId,
      guestName,
      guestPhone,
      guestEmail = '',
      propertyId,
      roomTypeName,
      checkIn,
      checkOut,
      nights = 1,
      guestsCount = 2,
      roomCharge = 0,
      extraGuestCharge = 0,
      discount = 0,
      validDays = 7,
      notes,
    } = body;

    if (!guestName || !guestPhone || !propertyId || !roomTypeName || !checkIn || !checkOut) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: guestName, guestPhone, propertyId, roomTypeName, checkIn, and checkOut are required.',
        },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
    }

    const count = await prisma.quotation.count();
    const quotationNumber = `OD-Q-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const numNights = Number(nights) || 1;
    const numRoomCharge = Number(roomCharge) || 0;
    const numExtraGuestCharge = Number(extraGuestCharge) || 0;
    const numDiscount = Number(discount) || 0;
    const taxableAmount = Math.max(0, numRoomCharge + numExtraGuestCharge - numDiscount);
    const tax = Math.round(taxableAmount * 0.12);
    const total = taxableAmount + tax;

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + Number(validDays || 7));
    const validUntil = validUntilDate.toISOString().split('T')[0];

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        leadId: leadId || null,
        guestName,
        guestPhone,
        guestEmail,
        propertyId,
        propertyName: property.name,
        roomTypeName,
        checkIn,
        checkOut,
        nights: numNights,
        guestsCount: Number(guestsCount) || 2,
        roomCharge: numRoomCharge,
        extraGuestCharge: numExtraGuestCharge,
        discount: numDiscount,
        tax,
        total,
        validUntil,
        status: 'Sent',
        notes,
      },
      include: {
        property: true,
        lead: true,
      },
    });

    // If linked to lead, update lead status to Quotation Sent
    if (leadId) {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: 'Quotation_Sent',
          quotationId: quotation.id,
        },
      });
    }

    return NextResponse.json({ success: true, data: quotation }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating quotation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quotation', details: error?.message },
      { status: 500 }
    );
  }
}
