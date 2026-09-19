import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/expenses/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!expense) {
      return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: expense });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expense', details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/expenses/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...(body.date !== undefined ? { date: body.date } : {}),
        ...(body.vendor !== undefined ? { vendor: body.vendor } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.amount !== undefined ? { amount: Number(body.amount) } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.paymentMode !== undefined ? { paymentMode: body.paymentMode } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update expense', details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete expense', details: error?.message },
      { status: 500 }
    );
  }
}
