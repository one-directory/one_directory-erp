import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Priority, StaffTaskStatus, StaffDepartment } from '@prisma/client';

// GET /api/staff-tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const department = searchParams.get('department') as StaffDepartment | null;
    const status = searchParams.get('status') as StaffTaskStatus | null;
    const assignedTo = searchParams.get('assignedTo');

    const tasks = await prisma.staffTask.findMany({
      where: {
        ...(propertyId && propertyId !== 'all' ? { propertyId } : {}),
        ...(department ? { department } : {}),
        ...(status ? { status } : {}),
        ...(assignedTo ? { assignedTo } : {}),
      },
      include: {
        property: { select: { id: true, name: true } },
      },
      orderBy: { due: 'asc' },
    });

    return NextResponse.json({ success: true, count: tasks.length, data: tasks });
  } catch (error: any) {
    console.error('Error fetching staff tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff tasks', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/staff-tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      propertyId,
      assignedTo,
      priority = 'Normal',
      due = 'Today, 6:00 PM',
      department = 'Reception',
      status = 'Pending',
    } = body;

    if (!title || !propertyId || !assignedTo) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, propertyId, and assignedTo are required.' },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
    }

    const newTask = await prisma.staffTask.create({
      data: {
        title,
        propertyId,
        propertyName: property.name,
        assignedTo,
        priority: (priority as Priority) || 'Normal',
        due,
        department: (department as StaffDepartment) || 'Reception',
        status: (status as StaffTaskStatus) || 'Pending',
      },
      include: { property: true },
    });

    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating staff task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create staff task', details: error?.message },
      { status: 500 }
    );
  }
}
