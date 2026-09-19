import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LeadStatus, LeadSource } from '@prisma/client';

// GET /api/leads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status') as LeadStatus | null;
    const assignedTo = searchParams.get('assignedTo');
    const q = searchParams.get('q');

    const leads = await prisma.lead.findMany({
      where: {
        ...(propertyId && propertyId !== 'all' ? { propertyId } : {}),
        ...(status ? { status } : {}),
        ...(assignedTo ? { assignedTo } : {}),
        ...(q
          ? {
              OR: [
                { leadNumber: { contains: q, mode: 'insensitive' } },
                { guestName: { contains: q, mode: 'insensitive' } },
                { guestPhone: { contains: q } },
                { guestEmail: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        property: { select: { id: true, name: true, location: true } },
        guest: true,
        followUps: {
          orderBy: { scheduledDate: 'desc' },
          take: 3,
        },
        _count: {
          select: { followUps: true, callLogs: true, quotations: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/leads
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      guestName,
      guestPhone,
      guestEmail = '',
      propertyId,
      checkIn,
      checkOut,
      guestsCount = 2,
      estimatedValue = 0,
      source = 'Phone Call',
      assignedTo = 'Sales Team',
      status = 'New',
      nextFollowUpDate = new Date().toISOString().split('T')[0],
      notes = '',
    } = body;

    if (!guestName || !guestPhone || !propertyId || !checkIn || !checkOut) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: guestName, guestPhone, propertyId, checkIn, and checkOut are required.',
        },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
    }

    // Find or create guest by phone
    let guest = await prisma.guest.findFirst({ where: { phone: guestPhone } });
    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          name: guestName,
          phone: guestPhone,
          email: guestEmail,
          status: 'First_time',
        },
      });
    }

    // Generate unique lead number
    const count = await prisma.lead.count();
    const leadNumber = `OD-LEAD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const leadSourceMap: Record<string, LeadSource> = {
      'Phone Call': 'Phone_Call',
      'WhatsApp': 'WhatsApp',
      'Website': 'Website',
      'Walk-in': 'Walk_in',
      'Referral': 'Referral',
      'Instagram': 'Instagram',
    };

    const newLead = await prisma.lead.create({
      data: {
        leadNumber,
        guestId: guest.id,
        guestName,
        guestPhone,
        guestEmail,
        propertyId,
        propertyName: property.name,
        checkIn,
        checkOut,
        guestsCount: Number(guestsCount),
        estimatedValue: Number(estimatedValue),
        source: leadSourceMap[source] || 'Phone_Call',
        assignedTo,
        status: (status as LeadStatus) || 'New',
        nextFollowUpDate,
        notes,
      },
      include: {
        property: true,
        guest: true,
      },
    });

    return NextResponse.json({ success: true, data: newLead }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lead', details: error?.message },
      { status: 500 }
    );
  }
}
