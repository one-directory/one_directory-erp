import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PropertyType, PropertyStatus } from '@prisma/client';

// GET /api/properties
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as PropertyStatus | null;
    const type = searchParams.get('type') as PropertyType | null;
    const includeUnits = searchParams.get('includeUnits') === 'true';

    const properties = await prisma.property.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
      },
      include: {
        unitTypes: includeUnits,
        units: includeUnits,
        _count: {
          select: {
            units: true,
            reservations: true,
            leads: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch properties',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

// POST /api/properties
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      type,
      location,
      contact,
      ownerName,
      ownerEmail,
      ownerPhone,
      description = '',
      amenities = [],
      status = 'Active',
    } = body;

    if (!name || !type || !location || !contact || !ownerName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, type, location, contact, and ownerName are required.',
        },
        { status: 400 }
      );
    }

    const newProperty = await prisma.property.create({
      data: {
        name,
        type: type as PropertyType,
        location,
        contact,
        ownerName,
        ownerEmail: ownerEmail || '',
        ownerPhone: ownerPhone || '',
        description,
        amenities,
        status: (status as PropertyStatus) || 'Active',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newProperty,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create property',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
