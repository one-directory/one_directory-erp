import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const read = searchParams.get('read');
    const take = Math.min(parseInt(searchParams.get('take') || '50'), 200);

    const notifications = await prisma.notification.findMany({
      where: {
        ...(read === 'true' ? { read: true } : read === 'false' ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    const unreadCount = await prisma.notification.count({ where: { read: false } });

    return NextResponse.json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, type, link } = body;

    if (!title || !message || !type) {
      return NextResponse.json(
        { success: false, error: 'title, message, and type are required.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        time: now.toTimeString().split(' ')[0],
        read: false,
        link: link || null,
      },
    });

    return NextResponse.json({ success: true, data: notification }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to create notification', details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark all as read
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const markAll = searchParams.get('markAll');

    if (markAll === 'true') {
      await prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
      return NextResponse.json({ success: true, message: 'All notifications marked as read.' });
    }

    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required.' }, { status: 400 });
    }

    const updated = await prisma.notification.update({ where: { id }, data: { read: true } });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update notification', details: error?.message },
      { status: 500 }
    );
  }
}
