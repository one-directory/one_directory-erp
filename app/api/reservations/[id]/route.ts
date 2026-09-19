import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReservationStatus } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/reservations/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        property: true,
        unit: true,
        guest: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          include: { items: true },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json({ success: false, error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: reservation });
  } catch (error: any) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reservation', details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/reservations/[id] (Check-in, Check-out, and Status workflows)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.reservation.findUnique({
      where: { id },
      include: { unit: true, property: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Reservation not found' }, { status: 404 });
    }

    const { action, status, paid, specialRequests } = body;

    let targetStatus = existing.status;
    if (action === 'check-in') targetStatus = 'Checked_In';
    else if (action === 'check-out') targetStatus = 'Checked_Out';
    else if (action === 'cancel') targetStatus = 'Cancelled';
    else if (status) targetStatus = status as ReservationStatus;

    let updatedPaid = existing.paid;
    if (paid !== undefined) {
      updatedPaid = Number(paid);
    }
    const updatedBalance = existing.total - updatedPaid;

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: targetStatus,
        paid: updatedPaid,
        balance: updatedBalance,
        ...(specialRequests !== undefined ? { specialRequests } : {}),
      },
    });

    // 1. If Checked In: flip unit status to Occupied
    if (targetStatus === 'Checked_In' || targetStatus === 'In_House') {
      await prisma.unit.update({
        where: { id: existing.unitId },
        data: {
          status: 'Occupied',
          currentReservationId: existing.id,
          currentGuestName: existing.guestName,
          currentCheckOut: existing.checkOut,
        },
      });
    }

    // 2. If Checked Out: flip unit status to Dirty and automatically trigger Housekeeping task
    if (targetStatus === 'Checked_Out' || targetStatus === 'Completed') {
      await prisma.unit.update({
        where: { id: existing.unitId },
        data: {
          status: 'Dirty',
          currentReservationId: null,
          currentGuestName: null,
          currentCheckOut: null,
        },
      });

      // Automatically create Checkout Cleaning task
      await prisma.housekeepingTask.create({
        data: {
          propertyId: existing.propertyId,
          propertyName: existing.propertyName,
          unitId: existing.unitId,
          unitNumber: existing.unitNumber,
          taskType: 'Checkout_Cleaning',
          assignedTo: 'Housekeeping Team',
          scheduledTime: 'Immediate',
          status: 'Pending',
          priority: 'Urgent',
          notes: `Checkout cleaning for guest: ${existing.guestName} (${existing.bookingId})`,
        },
      });
    }

    // 3. If Cancelled: clear unit if attached
    if (targetStatus === 'Cancelled') {
      await prisma.unit.update({
        where: { id: existing.unitId },
        data: {
          status: 'Available',
          currentReservationId: null,
          currentGuestName: null,
          currentCheckOut: null,
        },
      });
    }

    return NextResponse.json({ success: true, data: updatedReservation });
  } catch (error: any) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update reservation', details: error?.message },
      { status: 500 }
    );
  }
}
