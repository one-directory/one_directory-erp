import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

// GET /api/payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const reservationId = searchParams.get('reservationId');
    const status = searchParams.get('status') as PaymentStatus | null;

    const payments = await prisma.payment.findMany({
      where: {
        ...(propertyId && propertyId !== 'all' ? { propertyId } : {}),
        ...(reservationId ? { reservationId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        property: { select: { id: true, name: true } },
        reservation: {
          select: {
            id: true,
            bookingId: true,
            total: true,
            paid: true,
            balance: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, count: payments.length, data: payments });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/payments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reservationId,
      amount,
      method = 'UPI',
      referenceNumber,
      collectedBy = 'Front Desk',
    } = body;

    if (!reservationId || amount === undefined || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: 'reservationId and a valid amount are required.' },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { property: true },
    });

    if (!reservation) {
      return NextResponse.json({ success: false, error: 'Reservation not found.' }, { status: 404 });
    }

    const payCount = await prisma.payment.count();
    const paymentId = `OD-PAY-${new Date().getFullYear()}-${String(payCount + 1).padStart(5, '0')}`;

    const paymentMethodMap: Record<string, PaymentMethod> = {
      'Cash': 'Cash',
      'UPI': 'UPI',
      'Credit Card': 'Credit_Card',
      'Debit Card': 'Debit_Card',
      'Bank Transfer': 'Bank_Transfer',
      'Payment Gateway': 'Payment_Gateway',
      'Other': 'Other',
    };

    const numAmount = Number(amount);

    const newPayment = await prisma.payment.create({
      data: {
        paymentId,
        reservationId: reservation.id,
        bookingId: reservation.bookingId,
        guestName: reservation.guestName,
        propertyId: reservation.propertyId,
        propertyName: reservation.propertyName,
        amount: numAmount,
        method: paymentMethodMap[method] || 'UPI',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Success',
        referenceNumber: referenceNumber || `REF-${paymentId}`,
        collectedBy,
      },
    });

    // Update reservation paid and balance
    const newPaid = reservation.paid + numAmount;
    const newBalance = Math.max(0, reservation.total - newPaid);

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        paid: newPaid,
        balance: newBalance,
      },
    });

    return NextResponse.json({ success: true, data: newPayment }, { status: 201 });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record payment', details: error?.message },
      { status: 500 }
    );
  }
}
