import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SettlementStatus } from '@prisma/client';

// GET /api/owner-settlements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status') as SettlementStatus | null;

    const settlements = await prisma.ownerSettlement.findMany({
      where: {
        ...(propertyId && propertyId !== 'all' ? { propertyId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        property: { select: { id: true, name: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, count: settlements.length, data: settlements });
  } catch (error: any) {
    console.error('Error fetching settlements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch owner settlements', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/owner-settlements (Auto-generate from revenue data)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      period,
      grossRevenue,
      taxes = 0,
      otaCommission = 0,
      otherDeductions = 0,
      managementFeePct = 15,
      amountPaid = 0,
      items = [],
    } = body;

    if (!propertyId || !period || grossRevenue === undefined) {
      return NextResponse.json(
        { success: false, error: 'propertyId, period, and grossRevenue are required.' },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
    }

    const count = await prisma.ownerSettlement.count();
    const settlementNumber = `OD-SETL-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const numGross = Number(grossRevenue);
    const numTaxes = Number(taxes);
    const numOta = Number(otaCommission);
    const numOther = Number(otherDeductions);
    const numFeePct = Number(managementFeePct);
    const netRevenue = numGross - numTaxes - numOta - numOther;
    const managementFee = Math.round(netRevenue * (numFeePct / 100));
    const ownerShare = netRevenue - managementFee;
    const numPaid = Number(amountPaid);
    const balance = Math.max(0, ownerShare - numPaid);
    const status: SettlementStatus = balance === 0 ? 'Paid' : numPaid > 0 ? 'Partially_Paid' : 'Draft';

    const defaultItems = [
      { description: 'Gross Revenue from Bookings', type: 'revenue', amount: numGross },
      ...(numTaxes > 0 ? [{ description: 'GST & Applicable Taxes', type: 'deduction', amount: numTaxes }] : []),
      ...(numOta > 0 ? [{ description: 'OTA Platform Commissions', type: 'deduction', amount: numOta }] : []),
      ...(numOther > 0 ? [{ description: 'Other Operating Deductions', type: 'deduction', amount: numOther }] : []),
      { description: `One Directory Management Fee (${numFeePct}%)`, type: 'deduction', amount: managementFee },
    ];

    const lineItems = items.length > 0 ? items : defaultItems;

    const settlement = await prisma.ownerSettlement.create({
      data: {
        settlementNumber,
        propertyId,
        propertyName: property.name,
        ownerName: property.ownerName,
        ownerEmail: property.ownerEmail,
        period,
        grossRevenue: numGross,
        taxes: numTaxes,
        otaCommission: numOta,
        otherDeductions: numOther,
        netRevenue,
        managementFeePct: numFeePct,
        managementFee,
        ownerShare,
        amountPaid: numPaid,
        balance,
        status,
        items: {
          create: lineItems.map((it: any) => ({
            description: it.description,
            type: it.type,
            amount: Number(it.amount),
          })),
        },
      },
      include: { items: true, property: true },
    });

    return NextResponse.json({ success: true, data: settlement }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating settlement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create owner settlement', details: error?.message },
      { status: 500 }
    );
  }
}
