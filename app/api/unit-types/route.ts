import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/unit-types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    const unitTypes = await prisma.unitType.findMany({
      where: {
        ...(propertyId ? { propertyId } : {}),
      },
      include: {
        units: true,
        _count: {
          select: { units: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      count: unitTypes.length,
      data: unitTypes,
    });
  } catch (error: any) {
    console.error('Error fetching unit types:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch unit types',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

// POST /api/unit-types
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      name,
      capacity = 2,
      bedConfiguration = '1 King Bed',
      baseRate,
      numberOfUnits = 1,
      amenities = [],
      status = 'Active',
    } = body;

    if (!propertyId || !name || baseRate === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: propertyId, name, and baseRate are required.',
        },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Referenced property does not exist.' },
        { status: 404 }
      );
    }

    const newUnitType = await prisma.unitType.create({
      data: {
        propertyId,
        propertyName: property.name,
        name,
        capacity: Number(capacity),
        bedConfiguration,
        baseRate: Number(baseRate),
        numberOfUnits: Number(numberOfUnits),
        amenities,
        status,
      },
    });

    return NextResponse.json(
      { success: true, data: newUnitType },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating unit type:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create unit type',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
