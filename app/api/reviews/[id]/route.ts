import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/reviews/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const review = await prisma.review.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review', details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/reviews/[id] - Respond to a review
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    const { responseText, responseDate } = body;

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...(responseText !== undefined
          ? {
              responseText,
              responseStatus: 'Responded',
              responseDate: responseDate || new Date().toISOString().split('T')[0],
            }
          : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update review', details: error?.message },
      { status: 500 }
    );
  }
}
