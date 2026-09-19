import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { HousekeepingStatus, HousekeepingTaskType, Priority } from '@prisma/client';

// GET /api/housekeeping
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status') as HousekeepingStatus | null;
    const unitId = searchParams.get('unitId');

    const tasks = await prisma.housekeepingTask.findMany({
      where: {
        ...(propertyId && propertyId !== 'all' ? { propertyId } : {}),
        ...(status ? { status } : {}),
        ...(unitId ? { unitId } : {}),
      },
      include: {
        property: { select: { id: true, name: true } },
        unit: { select: { id: true, number: true, name: true, status: true } },
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { scheduledTime: 'asc' },
      ],
    });

    return NextResponse.json({ success: true, count: tasks.length, data: tasks });
  } catch (error: any) {
    console.error('Error fetching housekeeping tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch housekeeping tasks', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/housekeeping
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      unitId,
      taskType = 'Regular Cleaning',
      assignedTo = 'Housekeeping Staff',
      scheduledTime = '11:00 AM',
      priority = 'Normal',
      notes,
    } = body;

    if (!propertyId || !unitId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: propertyId and unitId.' },
        { status: 400 }
      );
    }

    const [property, unit] = await Promise.all([
      prisma.property.findUnique({ where: { id: propertyId } }),
      prisma.unit.findUnique({ where: { id: unitId } }),
    ]);

    if (!property || !unit) {
      return NextResponse.json(
        { success: false, error: 'Property or Unit not found.' },
        { status: 404 }
      );
    }

    const taskTypeMap: Record<string, HousekeepingTaskType> = {
      'Checkout Cleaning': 'Checkout_Cleaning',
      'Regular Cleaning': 'Regular_Cleaning',
      'Deep Cleaning': 'Deep_Cleaning',
      'Linen Change': 'Linen_Change',
      'Inspection': 'Inspection',
    };

    const newTask = await prisma.housekeepingTask.create({
      data: {
        propertyId,
        propertyName: property.name,
        unitId,
        unitNumber: unit.number,
        taskType: taskTypeMap[taskType] || 'Regular_Cleaning',
        assignedTo,
        scheduledTime,
        status: 'Pending',
        priority: (priority as Priority) || 'Normal',
        notes,
      },
    });

    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating housekeeping task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create housekeeping task', details: error?.message },
      { status: 500 }
    );
  }
}
