import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/quotations/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { property: true, lead: true },
    });

    if (!quotation) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: quotation });
  } catch (error: any) {
    console.error('Error fetching quotation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotation', details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/quotations/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
    }

    const { status, discount, extraGuestCharge, notes, action, unitId } = body;

    // 1. If action is 'convert' to booking
    if (action === 'convert') {
      if (!unitId) {
        return NextResponse.json(
          { success: false, error: 'unitId is required to convert a quotation to a reservation.' },
          { status: 400 }
        );
      }

      const unit = await prisma.unit.findUnique({ where: { id: unitId } });
      if (!unit) {
        return NextResponse.json({ success: false, error: 'Assigned unit not found.' }, { status: 404 });
      }

      // Find or create guest
      let guest = await prisma.guest.findFirst({ where: { phone: existing.guestPhone } });
      if (!guest) {
        guest = await prisma.guest.create({
          data: {
            name: existing.guestName,
            phone: existing.guestPhone,
            email: existing.guestEmail,
            status: 'First_time',
          },
        });
      }

      const bkgCount = await prisma.reservation.count();
      const bookingId = `OD-BKG-${new Date().getFullYear()}-${String(bkgCount + 1).padStart(5, '0')}`;

      const reservation = await prisma.reservation.create({
        data: {
          bookingId,
          guestId: guest.id,
          guestName: existing.guestName,
          guestPhone: existing.guestPhone,
          guestEmail: existing.guestEmail,
          propertyId: existing.propertyId,
          propertyName: existing.propertyName,
          unitId: unit.id,
          unitNumber: unit.number,
          unitTypeName: unit.unitTypeName,
          checkIn: existing.checkIn,
          checkOut: existing.checkOut,
          nights: existing.nights,
          guestsCount: existing.guestsCount,
          source: 'Website',
          rate: existing.roomCharge + existing.extraGuestCharge,
          discount: existing.discount,
          tax: existing.tax,
          total: existing.total,
          paid: 0,
          balance: existing.total,
          status: 'Confirmed',
          quotationId: existing.id,
          leadId: existing.leadId,
        },
      });

      // Update quotation status to Accepted
      await prisma.quotation.update({
        where: { id },
        data: { status: 'Accepted' },
      });

      // Update lead if attached to Confirmed
      if (existing.leadId) {
        await prisma.lead.update({
          where: { id: existing.leadId },
          data: { status: 'Confirmed', reservationId: reservation.id },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Quotation converted to reservation successfully',
        data: { quotationId: id, reservation },
      });
    }

    // Standard update
    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(discount !== undefined ? { discount: Number(discount) } : {}),
        ...(extraGuestCharge !== undefined ? { extraGuestCharge: Number(extraGuestCharge) } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating quotation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quotation', details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/quotations/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.quotation.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Quotation deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quotation', details: error?.message },
      { status: 500 }
    );
  }
}
