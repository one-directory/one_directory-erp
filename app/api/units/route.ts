import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UnitStatus } from '@prisma/client';

// GET /api/units
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const unitTypeId = searchParams.get('unitTypeId');
    const status = searchParams.get('status') as UnitStatus | null;

    const units = await prisma.unit.findMany({
      where: {
        ...(propertyId ? { propertyId } : {}),
        ...(unitTypeId ? { unitTypeId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        unitType: true,
        property: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: [
        { propertyName: 'asc' },
        { number: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      count: units.length,
      data: units,
    });
  } catch (error: any) {
    console.error('Error fetching units:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch units',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

// POST /api/units
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      unitTypeId,
      number,
      name,
      floor = '1',
      status = 'Available',
    } = body;

    if (!propertyId || !unitTypeId || !number) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: propertyId, unitTypeId, and number are required.',
        },
        { status: 400 }
      );
    }

    const [property, unitType] = await Promise.all([
      prisma.property.findUnique({ where: { id: propertyId } }),
      prisma.unitType.findUnique({ where: { id: unitTypeId } }),
    ]);

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Referenced property not found.' },
        { status: 404 }
      );
    }

    if (!unitType) {
      return NextResponse.json(
        { success: false, error: 'Referenced unit type not found.' },
        { status: 404 }
      );
    }

    const newUnit = await prisma.unit.create({
      data: {
        propertyId,
        propertyName: property.name,
        unitTypeId,
        unitTypeName: unitType.name,
        number,
        name: name || `${unitType.name} ${number}`,
        floor: String(floor),
        status: (status as UnitStatus) || 'Available',
      },
    });

    // Increment property totalUnits count
    await prisma.property.update({
      where: { id: propertyId },
      data: { totalUnits: { increment: 1 } },
    });

    return NextResponse.json(
      { success: true, data: newUnit },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating unit:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create unit',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
