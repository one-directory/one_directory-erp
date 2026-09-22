import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LeadStatus } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const statusMap: Record<string, LeadStatus> = {
  'New': 'New',
  'Contacted': 'Contacted',
  'Interested': 'Interested',
  'Quotation Sent': 'Quotation_Sent',
  'Quotation_Sent': 'Quotation_Sent',
  'Follow-up': 'Follow_up',
  'Follow_up': 'Follow_up',
  'Confirmed': 'Confirmed',
  'Not Interested': 'Not_Interested',
  'Not_Interested': 'Not_Interested',
  'No Response': 'No_Response',
  'No_Response': 'No_Response',
  'Lost': 'Lost',
};

// GET /api/leads/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        property: true,
        guest: true,
        followUps: true,
        callLogs: true,
        quotations: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: lead });
  } catch (error: any) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lead', details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/leads/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const { status, notes, nextFollowUpDate, assignedTo, quotationId, reservationId } = body;

    const dataToUpdate: any = {};
    if (status !== undefined) {
      dataToUpdate.status = statusMap[status] || status;
    }
    if (notes !== undefined) dataToUpdate.notes = notes;
    if (nextFollowUpDate !== undefined) dataToUpdate.nextFollowUpDate = nextFollowUpDate;
    if (assignedTo !== undefined) dataToUpdate.assignedTo = assignedTo;
    if (quotationId !== undefined) dataToUpdate.quotationId = quotationId;
    if (reservationId !== undefined) dataToUpdate.reservationId = reservationId;

    const updated = await prisma.lead.update({
      where: { id },
      data: dataToUpdate,
      include: {
        property: true,
        guest: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead', details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete lead', details: error?.message },
      { status: 500 }
    );
  }
}
