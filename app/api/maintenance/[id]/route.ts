import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MaintenanceStatus, Priority } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/maintenance/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id },
      include: { property: true, unit: true },
    });

    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    console.error('Error fetching maintenance ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ticket', details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/maintenance/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.maintenanceTicket.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }

    const { status, assignedTo, priority, estimatedCost, resolutionNotes } = body;
    const targetStatus = (status as MaintenanceStatus) || existing.status;

    const updated = await prisma.maintenanceTicket.update({
      where: { id },
      data: {
        status: targetStatus,
        ...(assignedTo !== undefined ? { assignedTo } : {}),
        ...(priority !== undefined ? { priority: priority as Priority } : {}),
        ...(estimatedCost !== undefined ? { estimatedCost: Number(estimatedCost) } : {}),
        ...(resolutionNotes !== undefined ? { resolutionNotes } : {}),
      },
      include: { unit: true, property: true },
    });

    // If resolved or closed, restore room to Inspection or Available
    if (targetStatus === 'Resolved' || targetStatus === 'Closed') {
      await prisma.unit.update({
        where: { id: existing.unitId },
        data: { status: 'Inspection' },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating maintenance ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ticket', details: error?.message },
      { status: 500 }
    );
  }
}
