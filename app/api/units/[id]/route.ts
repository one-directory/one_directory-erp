import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UnitStatus } from '@prisma/client';
import { toPrismaUnitStatus } from '@/lib/prisma-enums';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/units/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        property: true,
        unitType: true,
        housekeepingTasks: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        maintenanceTickets: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        reservations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!unit) {
      return NextResponse.json({ success: false, error: 'Unit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: unit });
  } catch (error: any) {
    console.error('Error fetching unit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch unit', details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/units/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existingUnit = await prisma.unit.findUnique({ where: { id } });
    if (!existingUnit) {
      return NextResponse.json({ success: false, error: 'Unit not found' }, { status: 404 });
    }

    const updatedUnit = await prisma.unit.update({
      where: { id },
      data: {
        ...(body.status !== undefined ? { status: toPrismaUnitStatus(body.status) } : {}),
        ...(body.number !== undefined ? { number: body.number } : {}),
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.floor !== undefined ? { floor: String(body.floor) } : {}),
        ...(body.currentReservationId !== undefined ? { currentReservationId: body.currentReservationId } : {}),
        ...(body.currentGuestName !== undefined ? { currentGuestName: body.currentGuestName } : {}),
        ...(body.currentCheckOut !== undefined ? { currentCheckOut: body.currentCheckOut } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updatedUnit });
  } catch (error: any) {
    console.error('Error updating unit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update unit', details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/units/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const unit = await prisma.unit.findUnique({ where: { id } });
    if (!unit) {
      return NextResponse.json({ success: false, error: 'Unit not found' }, { status: 404 });
    }

    await prisma.unit.delete({ where: { id } });

    // Decrement property totalUnits
    await prisma.property.update({
      where: { id: unit.propertyId },
      data: { totalUnits: { decrement: 1 } },
    });

    return NextResponse.json({ success: true, message: 'Unit deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting unit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete unit', details: error?.message },
      { status: 500 }
    );
  }
}
