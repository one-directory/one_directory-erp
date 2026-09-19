import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GuestStatus } from '@prisma/client';

// GET /api/guests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const vip = searchParams.get('vip');
    const status = searchParams.get('status') as GuestStatus | null;

    const guests = await prisma.guest.findMany({
      where: {
        ...(vip !== null && vip !== undefined ? { vip: vip === 'true' } : {}),
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { phone: { contains: q } },
                { email: { contains: q, mode: 'insensitive' } },
                { idProofNumber: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        _count: {
          select: {
            reservations: true,
            leads: true,
            followUps: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      count: guests.length,
      data: guests,
    });
  } catch (error: any) {
    console.error('Error fetching guests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch guests', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/guests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      idProofNumber,
      vip = false,
      preferences = [],
      status = 'Regular',
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone number are required.' },
        { status: 400 }
      );
    }

    const newGuest = await prisma.guest.create({
      data: {
        name,
        phone,
        email: email || '',
        idProofNumber: idProofNumber || null,
        vip: Boolean(vip),
        preferences,
        status: (status as GuestStatus) || 'Regular',
      },
    });

    return NextResponse.json({ success: true, data: newGuest }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating guest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create guest', details: error?.message },
      { status: 500 }
    );
  }
}
