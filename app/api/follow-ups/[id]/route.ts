import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FollowUpStatus } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/follow-ups/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const followUp = await prisma.followUp.findUnique({
      where: { id },
      include: {
        property: true,
        lead: true,
        guest: true,
      },
    });

    if (!followUp) {
      return NextResponse.json({ success: false, error: 'Follow-up not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: followUp });
  } catch (error: any) {
    console.error('Error fetching follow-up:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch follow-up', details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/follow-ups/[id] (Complete or Reschedule workflow)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.followUp.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Follow-up not found' }, { status: 404 });
    }

    const {
      status,
      callOutcome,
      callDuration,
      notes,
      nextAction,
      scheduledDate,
      scheduledTime,
    } = body;

    const updated = await prisma.followUp.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status: status as FollowUpStatus } : {}),
        ...(callOutcome !== undefined ? { callOutcome } : {}),
        ...(callDuration !== undefined ? { callDuration } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(nextAction !== undefined ? { nextAction } : {}),
        ...(scheduledDate !== undefined ? { scheduledDate } : {}),
        ...(scheduledTime !== undefined ? { scheduledTime } : {}),
        ...(status === 'Completed' ? { completedAt: new Date() } : {}),
      },
    });

    // If call outcome provided, automatically create a call log entry
    if (callOutcome) {
      await prisma.callLog.create({
        data: {
          leadId: existing.leadId,
          guestId: existing.guestId,
          guestName: existing.guestName,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          direction: 'Outbound',
          duration: callDuration || '3 min',
          staff: existing.assignedTo,
          outcome: callOutcome,
          notes: notes || `Follow-up completed with outcome: ${callOutcome}`,
        },
      });
    }

    // If next action is to schedule next follow-up, create a new pending follow-up
    if (nextAction === 'Create next follow-up' && body.nextFollowUpDate) {
      await prisma.followUp.create({
        data: {
          leadId: existing.leadId,
          guestId: existing.guestId,
          guestName: existing.guestName,
          guestPhone: existing.guestPhone,
          propertyId: existing.propertyId,
          propertyName: existing.propertyName,
          type: existing.type,
          purpose: `Next follow-up after: ${callOutcome || 'call'}`,
          scheduledDate: body.nextFollowUpDate,
          scheduledTime: body.nextFollowUpTime || '11:00 AM',
          assignedTo: existing.assignedTo,
          status: 'Pending',
          urgency: 'Tomorrow',
          notes: body.nextFollowUpNotes || '',
        },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating follow-up:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update follow-up', details: error?.message },
      { status: 500 }
    );
  }
}
