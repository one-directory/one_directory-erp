import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/call-logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const guestId = searchParams.get('guestId');
    const take = Math.min(parseInt(searchParams.get('take') || '50'), 200);

    const logs = await prisma.callLog.findMany({
      where: {
        ...(leadId ? { leadId } : {}),
        ...(guestId ? { guestId } : {}),
      },
      include: {
        lead: { select: { id: true, leadNumber: true, guestName: true } },
        guest: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    return NextResponse.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    console.error('Error fetching call logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch call logs', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/call-logs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, guestId, guestName, date, time, direction = 'Outbound', duration, staff, outcome, notes } = body;

    if (!guestName || !date || !time || !duration || !staff || !outcome) {
      return NextResponse.json(
        {
          success: false,
          error: 'guestName, date, time, duration, staff, and outcome are required.',
        },
        { status: 400 }
      );
    }

    const log = await prisma.callLog.create({
      data: {
        leadId: leadId || null,
        guestId: guestId || null,
        guestName,
        date,
        time,
        direction,
        duration,
        staff,
        outcome,
        notes: notes || '',
      },
    });

    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to create call log', details: error?.message },
      { status: 500 }
    );
  }
}
