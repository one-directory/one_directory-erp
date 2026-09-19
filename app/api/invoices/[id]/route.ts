import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InvoiceStatus } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/invoices/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        property: true,
        reservation: {
          include: { payments: true },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoice', details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/invoices/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    const { status, paid } = body;

    let updatedPaid = existing.paid;
    if (paid !== undefined) updatedPaid = Number(paid);
    const updatedBalance = Math.max(0, existing.total - updatedPaid);

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        paid: updatedPaid,
        balance: updatedBalance,
        status: status || (updatedBalance === 0 ? 'Paid' : 'Unpaid'),
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice', details: error?.message },
      { status: 500 }
    );
  }
}
