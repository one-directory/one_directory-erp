import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { HousekeepingStatus } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/housekeeping/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.housekeepingTask.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const { status, assignedTo, notes } = body;
    const targetStatus = (status as HousekeepingStatus) || existing.status;

    const updated = await prisma.housekeepingTask.update({
      where: { id },
      data: {
        status: targetStatus,
        ...(assignedTo !== undefined ? { assignedTo } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    // If task is in Cleaning, mark unit as Cleaning
    if (targetStatus === 'Cleaning') {
      await prisma.unit.update({
        where: { id: existing.unitId },
        data: { status: 'Cleaning' },
      });
    }

    // If task is in Inspection, mark unit as Inspection
    if (targetStatus === 'Inspection') {
      await prisma.unit.update({
        where: { id: existing.unitId },
        data: { status: 'Inspection' },
      });
    }

    // If task is Completed, mark unit as Available!
    if (targetStatus === 'Completed') {
      await prisma.unit.update({
        where: { id: existing.unitId },
        data: { status: 'Available' },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating housekeeping task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task', details: error?.message },
      { status: 500 }
    );
  }
}
