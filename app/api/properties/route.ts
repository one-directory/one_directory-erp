import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PropertyType, PropertyStatus } from '@prisma/client';
import { toPrismaPropertyType, toPrismaPropertyStatus } from '@/lib/prisma-enums';

// GET /api/properties
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawStatus = searchParams.get('status');
    const rawType = searchParams.get('type');
    const includeUnits = searchParams.get('includeUnits') === 'true';

    const status = rawStatus ? toPrismaPropertyStatus(rawStatus) : undefined;
    const type = rawType ? toPrismaPropertyType(rawType) : undefined;

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
      totalUnits = 0,
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

    const prismaType = toPrismaPropertyType(type);
    const prismaStatus = toPrismaPropertyStatus(status);
    const parsedTotalUnits = totalUnits ? parseInt(String(totalUnits), 10) : 0;

    const newProperty = await prisma.property.create({
      data: {
        name: name.trim(),
        type: prismaType,
        location: location.trim(),
        contact: contact.trim(),
        totalUnits: isNaN(parsedTotalUnits) ? 0 : parsedTotalUnits,
        ownerName: ownerName.trim(),
        ownerEmail: ownerEmail ? ownerEmail.trim() : '',
        ownerPhone: ownerPhone ? ownerPhone.trim() : '',
        description: description ? description.trim() : '',
        amenities: Array.isArray(amenities) ? amenities : [],
        status: prismaStatus,
      },
    });

    // Auto-create a primary unit type for this property so units can be attached right away
    await prisma.unitType.create({
      data: {
        propertyId: newProperty.id,
        propertyName: newProperty.name,
        name: 'Standard Room',
        capacity: 2,
        bedConfiguration: '1 King / Queen Bed',
        baseRate: 3500,
        numberOfUnits: newProperty.totalUnits || 1,
        amenities: ['WiFi', 'Air Conditioning', 'En-suite Bathroom'],
        status: 'Active',
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
