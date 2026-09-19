import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GuestStatus } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/guests/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        reservations: {
          orderBy: { createdAt: 'desc' },
          include: {
            property: { select: { id: true, name: true } },
            payments: true,
          },
        },
        leads: {
          orderBy: { createdAt: 'desc' },
          include: {
            property: { select: { id: true, name: true } },
            followUps: true,
          },
        },
        followUps: {
          orderBy: { scheduledDate: 'desc' },
        },
        callLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!guest) {
      return NextResponse.json({ success: false, error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: guest });
  } catch (error: any) {
    console.error('Error fetching guest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch guest', details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/guests/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(body.email !== undefined ? { email: body.email } : {}),
        ...(body.idProofNumber !== undefined ? { idProofNumber: body.idProofNumber } : {}),
        ...(body.vip !== undefined ? { vip: Boolean(body.vip) } : {}),
        ...(body.preferences !== undefined ? { preferences: body.preferences } : {}),
        ...(body.status !== undefined ? { status: body.status as GuestStatus } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updatedGuest });
  } catch (error: any) {
    console.error('Error updating guest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update guest', details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/guests/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.guest.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Guest deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting guest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete guest', details: error?.message },
      { status: 500 }
    );
  }
}
