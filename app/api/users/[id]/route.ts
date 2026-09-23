import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hashPassword } from '@/lib/auth';
import { UserRole } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id] - Super Admin only
export async function GET(req: NextRequest, context: RouteContext) {
  const authResult = await requireAuth(req, ['ADMIN'] as UserRole[]);
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { id } = await context.params;
    const user = await prisma.user.findUnique({
      where: { id },
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
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('[user GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch user.' }, { status: 500 });
  }
}

// PATCH /api/users/[id] - Super Admin only
export async function PATCH(req: NextRequest, context: RouteContext) {
  const authResult = await requireAuth(req, ['ADMIN'] as UserRole[]);
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name, role, department, phone, isActive, propertyIds, password } = body;

    const dataToUpdate: Record<string, unknown> = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (role !== undefined) dataToUpdate.role = role as UserRole;
    if (department !== undefined) dataToUpdate.department = department;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);
    if (propertyIds !== undefined) dataToUpdate.propertyIds = propertyIds;
    if (password) {
      dataToUpdate.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
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
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('[user PATCH] Error:', error);
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Super Admin only
export async function DELETE(req: NextRequest, context: RouteContext) {
  const authResult = await requireAuth(req, ['ADMIN'] as UserRole[]);
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { id } = await context.params;

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      await prisma.user.delete({ where: { id } });
      return NextResponse.json({
        success: true,
        message: 'User deleted permanently.',
      });
    }

    // Soft-deactivate user rather than hard deletion to preserve audit and log references
    const deactivatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, email: true, isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully.',
      data: deactivatedUser,
    });
  } catch (error) {
    console.error('[user DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to deactivate user.' }, { status: 500 });
  }
}
