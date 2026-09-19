import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StaffTaskStatus, Priority } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/staff-tasks/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const task = await prisma.staffTask.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    console.error('Error fetching staff task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff task', details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/staff-tasks/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.staffTask.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const { status, assignedTo, priority, due, title } = body;

    const updated = await prisma.staffTask.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status: status as StaffTaskStatus } : {}),
        ...(assignedTo !== undefined ? { assignedTo } : {}),
        ...(priority !== undefined ? { priority: priority as Priority } : {}),
        ...(due !== undefined ? { due } : {}),
        ...(title !== undefined ? { title } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating staff task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update staff task', details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/staff-tasks/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.staffTask.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting staff task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete staff task', details: error?.message },
      { status: 500 }
    );
  }
}
