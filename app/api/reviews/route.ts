import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReviewPlatform, ReviewResponseStatus } from '@prisma/client';

// GET /api/reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const platform = searchParams.get('platform') as ReviewPlatform | null;
    const responseStatus = searchParams.get('responseStatus') as ReviewResponseStatus | null;

    const reviews = await prisma.review.findMany({
      where: {
        ...(propertyId && propertyId !== 'all' ? { propertyId } : {}),
        ...(platform ? { platform } : {}),
        ...(responseStatus ? { responseStatus } : {}),
      },
      include: {
        property: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Aggregate average rating per property and overall
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      success: true,
      count: reviews.length,
      avgRating: Math.round(avgRating * 10) / 10,
      data: reviews,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      guestName,
      propertyId,
      platform,
      rating,
      date,
      comment,
    } = body;

    if (!guestName || !propertyId || !platform || rating === undefined || !comment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: guestName, propertyId, platform, rating, and comment are required.',
        },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
    }

    const platformMap: Record<string, ReviewPlatform> = {
      'Google': 'Google',
      'Tripadvisor': 'Tripadvisor',
      'Booking.com': 'Booking_com',
      'Agoda': 'Agoda',
      'Airbnb': 'Airbnb',
    };

    const newReview = await prisma.review.create({
      data: {
        guestName,
        propertyId,
        propertyName: property.name,
        platform: platformMap[platform] || 'Google',
        rating: Number(rating),
        date: date || new Date().toISOString().split('T')[0],
        comment,
        responseStatus: 'Pending',
      },
      include: { property: true },
    });

    return NextResponse.json({ success: true, data: newReview }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review', details: error?.message },
      { status: 500 }
    );
  }
}
