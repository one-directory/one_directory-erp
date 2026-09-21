import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UnitStatus } from '@prisma/client';
import { toPrismaUnitStatus } from '@/lib/prisma-enums';

// GET /api/units
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const unitTypeId = searchParams.get('unitTypeId');
    const rawStatus = searchParams.get('status');
    const status = rawStatus ? toPrismaUnitStatus(rawStatus) : undefined;

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
      number,
      name,
      floor = '1st Floor',
      status = 'Available',
    } = body;
    let { unitTypeId } = body;

    if (!propertyId || !number) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: propertyId and number are required.',
        },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Referenced property not found.' },
        { status: 404 }
      );
    }

    let unitType = unitTypeId
      ? await prisma.unitType.findUnique({ where: { id: unitTypeId } })
      : null;

    // Fallback if unitTypeId not provided or not found: fetch existing or create one
    if (!unitType) {
      unitType = await prisma.unitType.findFirst({ where: { propertyId } });
      if (!unitType) {
        unitType = await prisma.unitType.create({
          data: {
            propertyId,
            propertyName: property.name,
            name: 'Standard Room',
            capacity: 2,
            bedConfiguration: '1 Queen Bed',
            baseRate: 3500,
            numberOfUnits: 1,
            amenities: ['WiFi', 'Air Conditioning'],
            status: 'Active',
          },
        });
      }
      unitTypeId = unitType.id;
    }

    const prismaStatus = toPrismaUnitStatus(status);

    const newUnit = await prisma.unit.create({
      data: {
        propertyId,
        propertyName: property.name,
        unitTypeId,
        unitTypeName: unitType.name,
        number: String(number).trim(),
        name: name ? String(name).trim() : `${unitType.name} ${number}`,
        floor: String(floor).trim() || '1st Floor',
        status: prismaStatus,
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
