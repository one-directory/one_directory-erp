import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SettlementStatus } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/owner-settlements/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const settlement = await prisma.ownerSettlement.findUnique({
      where: { id },
      include: { items: true, property: true },
    });

    if (!settlement) {
      return NextResponse.json({ success: false, error: 'Settlement not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: settlement });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settlement', details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/owner-settlements/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.ownerSettlement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Settlement not found' }, { status: 404 });
    }

    const { status, amountPaid } = body;

    let updatedPaid = existing.amountPaid;
    if (amountPaid !== undefined) updatedPaid = Number(amountPaid);
    const updatedBalance = Math.max(0, existing.ownerShare - updatedPaid);

    const targetStatus =
      status ||
      (updatedBalance === 0 ? 'Paid' : updatedPaid > 0 ? 'Partially_Paid' : existing.status);

    const updated = await prisma.ownerSettlement.update({
      where: { id },
      data: {
        amountPaid: updatedPaid,
        balance: updatedBalance,
        status: targetStatus as SettlementStatus,
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update settlement', details: error?.message },
      { status: 500 }
    );
  }
}
