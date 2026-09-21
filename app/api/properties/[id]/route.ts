import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PropertyType, PropertyStatus } from '@prisma/client';
import { toPrismaPropertyType, toPrismaPropertyStatus } from '@/lib/prisma-enums';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/properties/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        unitTypes: true,
        units: true,
        reservations: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        housekeepingTasks: {
          where: { status: { not: 'Completed' } },
        },
        maintenanceTickets: {
          where: { status: { notIn: ['Resolved', 'Closed', 'Cancelled'] } },
        },
        _count: {
          select: {
            units: true,
            reservations: true,
            leads: true,
            reviews: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: property,
    });
  } catch (error: any) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch property',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

// PATCH /api/properties/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.type !== undefined ? { type: toPrismaPropertyType(body.type) } : {}),
        ...(body.location !== undefined ? { location: body.location } : {}),
        ...(body.contact !== undefined ? { contact: body.contact } : {}),
        ...(body.totalUnits !== undefined ? { totalUnits: parseInt(String(body.totalUnits), 10) } : {}),
        ...(body.ownerName !== undefined ? { ownerName: body.ownerName } : {}),
        ...(body.ownerEmail !== undefined ? { ownerEmail: body.ownerEmail } : {}),
        ...(body.ownerPhone !== undefined ? { ownerPhone: body.ownerPhone } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.amenities !== undefined ? { amenities: body.amenities } : {}),
        ...(body.status !== undefined ? { status: toPrismaPropertyStatus(body.status) } : {}),
        ...(body.occupancyRate !== undefined ? { occupancyRate: body.occupancyRate } : {}),
        ...(body.revenueThisMonth !== undefined ? { revenueThisMonth: body.revenueThisMonth } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedProperty,
    });
  } catch (error: any) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update property',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete property',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
