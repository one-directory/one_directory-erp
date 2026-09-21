import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hashPassword } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, ['ADMIN'] as UserRole[]);
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        propertyIds: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: users, count: users.length });
  } catch (error) {
    console.error('[users GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, ['ADMIN'] as UserRole[]);
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await req.json();
    const { name, email, password, role, department, phone, propertyIds } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'name, email, password, and role are required.' }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: role as UserRole,
        department: department || null,
        phone: phone || null,
        propertyIds: propertyIds || [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        isActive: true,
        propertyIds: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error('[users POST] Error:', error);
    return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
  }
}
