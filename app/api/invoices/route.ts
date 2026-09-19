import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InvoiceStatus } from '@prisma/client';

// GET /api/invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const reservationId = searchParams.get('reservationId');
    const status = searchParams.get('status') as InvoiceStatus | null;

    const invoices = await prisma.invoice.findMany({
      where: {
        ...(propertyId && propertyId !== 'all' ? { propertyId } : {}),
        ...(reservationId ? { reservationId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        property: { select: { id: true, name: true, location: true } },
        reservation: { select: { id: true, bookingId: true, checkIn: true, checkOut: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, count: invoices.length, data: invoices });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/invoices (Generate invoice from reservation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reservationId, dueDate, items = [], discount = 0, propertyGstin = '29AABCU9603R1ZM' } = body;

    if (!reservationId) {
      return NextResponse.json({ success: false, error: 'reservationId is required.' }, { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { property: true },
    });

    if (!reservation) {
      return NextResponse.json({ success: false, error: 'Reservation not found.' }, { status: 404 });
    }

    const count = await prisma.invoice.count();
    const invoiceNumber = `OD-INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const lineItems =
      items.length > 0
        ? items
        : [
            {
              description: `Accommodation: ${reservation.unitTypeName} (${reservation.nights} nights)`,
              quantity: reservation.nights,
              rate: Math.round(reservation.rate / reservation.nights),
              amount: reservation.rate,
            },
          ];

    const subtotal = lineItems.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0);
    const numDiscount = Number(discount) || reservation.discount;
    const taxable = Math.max(0, subtotal - numDiscount);
    const tax = Math.round(taxable * 0.12);
    const total = taxable + tax;
    const paid = reservation.paid;
    const balance = Math.max(0, total - paid);
    const status: InvoiceStatus = balance === 0 ? 'Paid' : 'Unpaid';

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        reservationId: reservation.id,
        bookingId: reservation.bookingId,
        guestName: reservation.guestName,
        guestPhone: reservation.guestPhone,
        guestEmail: reservation.guestEmail,
        propertyId: reservation.propertyId,
        propertyName: reservation.propertyName,
        propertyAddress: reservation.property.location,
        propertyGstin,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: dueDate || reservation.checkOut,
        subtotal,
        discount: numDiscount,
        tax,
        total,
        paid,
        balance,
        status,
        items: {
          create: lineItems.map((it: any) => ({
            description: it.description,
            quantity: Number(it.quantity) || 1,
            rate: Number(it.rate) || 0,
            amount: Number(it.amount) || 0,
          })),
        },
      },
      include: { items: true, property: true },
    });

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice', details: error?.message },
      { status: 500 }
    );
  }
}
