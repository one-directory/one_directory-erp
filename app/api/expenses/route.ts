import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ExpenseCategory, ExpenseStatus } from '@prisma/client';

// GET /api/expenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const category = searchParams.get('category') as ExpenseCategory | null;
    const status = searchParams.get('status') as ExpenseStatus | null;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const expenses = await prisma.expense.findMany({
      where: {
        ...(propertyId && propertyId !== 'all' ? { propertyId } : {}),
        ...(category ? { category } : {}),
        ...(status ? { status } : {}),
        ...(dateFrom ? { date: { gte: dateFrom } } : {}),
        ...(dateTo ? { date: { lte: dateTo } } : {}),
      },
      include: {
        property: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    // Aggregate totals
    const total = expenses.reduce((acc, e) => acc + e.amount, 0);

    return NextResponse.json({
      success: true,
      count: expenses.length,
      total,
      data: expenses,
    });
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expenses', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/expenses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      date,
      category,
      vendor,
      description,
      amount,
      paymentMode = 'UPI',
      status = 'Paid',
    } = body;

    if (!propertyId || !date || !category || !vendor || !description || amount === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: propertyId, date, category, vendor, description, and amount are required.',
        },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
    }

    const categoryMap: Record<string, ExpenseCategory> = {
      'Electricity': 'Electricity',
      'Water': 'Water',
      'Internet': 'Internet',
      'Laundry': 'Laundry',
      'Housekeeping': 'Housekeeping',
      'Maintenance': 'Maintenance',
      'Supplies': 'Supplies',
      'Staff': 'Staff',
      'Marketing': 'Marketing',
      'OTA Commission': 'OTA_Commission',
      'Transportation': 'Transportation',
      'Food': 'Food',
      'Other': 'Other',
    };

    const newExpense = await prisma.expense.create({
      data: {
        date,
        propertyId,
        propertyName: property.name,
        category: categoryMap[category] || 'Other',
        vendor,
        description,
        amount: Number(amount),
        status: (status as ExpenseStatus) || 'Paid',
        paymentMode,
      },
      include: { property: true },
    });

    return NextResponse.json({ success: true, data: newExpense }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create expense', details: error?.message },
      { status: 500 }
    );
  }
}
