import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FollowUpStatus, FollowUpUrgency, FollowUpType } from '@prisma/client';

// GET /api/follow-ups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status') as FollowUpStatus | null;
    const urgency = searchParams.get('urgency') as FollowUpUrgency | null;
    const assignedTo = searchParams.get('assignedTo');

    const followUps = await prisma.followUp.findMany({
      where: {
        ...(propertyId && propertyId !== 'all' ? { propertyId } : {}),
        ...(status ? { status } : {}),
        ...(urgency ? { urgency } : {}),
        ...(assignedTo ? { assignedTo } : {}),
      },
      include: {
        property: { select: { id: true, name: true } },
        lead: {
          select: {
            id: true,
            leadNumber: true,
            checkIn: true,
            checkOut: true,
            estimatedValue: true,
            status: true,
          },
        },
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTime: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      count: followUps.length,
      data: followUps,
    });
  } catch (error: any) {
    console.error('Error fetching follow-ups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch follow-ups', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/follow-ups
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      leadId,
      guestId,
      guestName,
      guestPhone,
      propertyId,
      type = 'Phone Call',
      purpose,
      scheduledDate,
      scheduledTime = '11:00 AM',
      assignedTo = 'Sales Team',
      urgency = 'Due Today',
      notes = '',
    } = body;

    if (!guestName || !guestPhone || !propertyId || !purpose || !scheduledDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: guestName, guestPhone, propertyId, purpose, and scheduledDate are required.',
        },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
    }

    const followUpTypeMap: Record<string, FollowUpType> = {
      'Phone Call': 'Phone_Call',
      'WhatsApp': 'WhatsApp',
      'Email': 'Email',
      'SMS': 'SMS',
      'In Person': 'In_Person',
      'Other': 'Other',
    };

    const followUpUrgencyMap: Record<string, FollowUpUrgency> = {
      'Overdue': 'Overdue',
      'Due Today': 'Due_Today',
      'Tomorrow': 'Tomorrow',
      'This Week': 'This_Week',
    };

    const newFollowUp = await prisma.followUp.create({
      data: {
        leadId: leadId || null,
        guestId: guestId || null,
        guestName,
        guestPhone,
        propertyId,
        propertyName: property.name,
        type: followUpTypeMap[type] || 'Phone_Call',
        purpose,
        scheduledDate,
        scheduledTime,
        assignedTo,
        status: 'Pending',
        urgency: followUpUrgencyMap[urgency] || 'Due_Today',
        notes,
      },
    });

    return NextResponse.json({ success: true, data: newFollowUp }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating follow-up:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create follow-up', details: error?.message },
      { status: 500 }
    );
  }
}
