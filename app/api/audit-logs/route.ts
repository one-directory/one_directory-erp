import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/audit-logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const user = searchParams.get('user');
    const action = searchParams.get('action');
    const recordId = searchParams.get('recordId');
    const take = Math.min(parseInt(searchParams.get('take') || '100'), 500);
    const skip = parseInt(searchParams.get('skip') || '0');

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(module ? { module } : {}),
        ...(user ? { user } : {}),
        ...(action ? { action } : {}),
        ...(recordId ? { recordId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    const total = await prisma.auditLog.count({
      where: {
        ...(module ? { module } : {}),
        ...(user ? { user } : {}),
        ...(action ? { action } : {}),
        ...(recordId ? { recordId } : {}),
      },
    });

    return NextResponse.json({ success: true, count: total, data: logs });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/audit-logs  (internal utility for other routes to call)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { module, action, user, recordId, details, beforeValue, afterValue } = body;

    if (!module || !action || !user || !recordId || !details) {
      return NextResponse.json(
        {
          success: false,
          error: 'module, action, user, recordId, and details are required.',
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const log = await prisma.auditLog.create({
      data: {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        user,
        action,
        module,
        recordId,
        details,
        ...(beforeValue ? { beforeValue: JSON.stringify(beforeValue) } : {}),
        ...(afterValue ? { afterValue: JSON.stringify(afterValue) } : {}),
      },
    });

    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to write audit log', details: error?.message },
      { status: 500 }
    );
  }
}
