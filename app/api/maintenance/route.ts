import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Priority, MaintenanceStatus } from '@prisma/client';

// GET /api/maintenance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const unitId = searchParams.get('unitId');
    const status = searchParams.get('status') as MaintenanceStatus | null;
    const priority = searchParams.get('priority') as Priority | null;

    const tickets = await prisma.maintenanceTicket.findMany({
      where: {
        ...(propertyId && propertyId !== 'all' ? { propertyId } : {}),
        ...(unitId ? { unitId } : {}),
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
      },
      include: {
        property: { select: { id: true, name: true } },
        unit: { select: { id: true, number: true, name: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, count: tickets.length, data: tickets });
  } catch (error: any) {
    console.error('Error fetching maintenance tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance tickets', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/maintenance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      unitId,
      issue,
      description,
      priority = 'Normal',
      assignedTo = 'Maintenance Team',
      estimatedCost,
    } = body;

    if (!propertyId || !unitId || !issue || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: propertyId, unitId, issue, and description are required.',
        },
        { status: 400 }
      );
    }

    const [property, unit] = await Promise.all([
      prisma.property.findUnique({ where: { id: propertyId } }),
      prisma.unit.findUnique({ where: { id: unitId } }),
    ]);

    if (!property || !unit) {
      return NextResponse.json({ success: false, error: 'Property or Unit not found.' }, { status: 404 });
    }

    const count = await prisma.maintenanceTicket.count();
    const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const newTicket = await prisma.maintenanceTicket.create({
      data: {
        ticketNumber,
        propertyId,
        propertyName: property.name,
        unitId,
        unitNumber: unit.number,
        issue,
        description,
        priority: (priority as Priority) || 'Normal',
        assignedTo,
        status: 'Open',
        estimatedCost: estimatedCost ? Number(estimatedCost) : null,
      },
      include: { property: true, unit: true },
    });

    // Automatically flip unit status to Maintenance
    await prisma.unit.update({
      where: { id: unitId },
      data: { status: 'Maintenance' },
    });

    return NextResponse.json({ success: true, data: newTicket }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating maintenance ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create maintenance ticket', details: error?.message },
      { status: 500 }
    );
  }
}
