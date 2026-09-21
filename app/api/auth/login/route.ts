import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, verifyPassword, AUTH_COOKIE_NAME, TokenPayload } from '@/lib/auth';

const BUILTIN_DEMO_USERS: Record<string, TokenPayload & { password: string }> = {
  'admin@onedirectory.com': {
    id: 'demo-admin-1',
    email: 'admin@onedirectory.com',
    name: 'Arvind Kulkarni',
    role: 'ADMIN',
    department: 'Executive Management',
    propertyIds: [],
    avatarUrl: null,
    password: 'password123',
  },
  'manager@onedirectory.com': {
    id: 'demo-mgr-1',
    email: 'manager@onedirectory.com',
    name: 'Priya Sharma',
    role: 'PROPERTY_MANAGER',
    department: 'Property Operations',
    propertyIds: [],
    avatarUrl: null,
    password: 'password123',
  },
  'frontdesk@onedirectory.com': {
    id: 'demo-fd-1',
    email: 'frontdesk@onedirectory.com',
    name: 'Rohit Nair',
    role: 'FRONT_DESK',
    department: 'Reception & Guest Services',
    propertyIds: [],
    avatarUrl: null,
    password: 'password123',
  },
  'operations@onedirectory.com': {
    id: 'demo-ops-1',
    email: 'operations@onedirectory.com',
    name: 'Kavya Menon',
    role: 'OPERATIONS',
    department: 'Housekeeping & Maintenance',
    propertyIds: [],
    avatarUrl: null,
    password: 'password123',
  },
  'accounts@onedirectory.com': {
    id: 'demo-acc-1',
    email: 'accounts@onedirectory.com',
    name: 'Suresh Rajan',
    role: 'ACCOUNTANT',
    department: 'Finance & Accounts',
    propertyIds: [],
    avatarUrl: null,
    password: 'password123',
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let payload: TokenPayload | null = null;

    // 1. Try real database user first
    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (user && user.isActive) {
        const isValid = await verifyPassword(password, user.passwordHash);
        if (isValid) {
          payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
            propertyIds: user.propertyIds,
            avatarUrl: user.avatarUrl,
          };
        }
      }
    } catch {
      // Prisma user table might not have users yet or database offline
    }

    // 2. Fallback to built-in system demo accounts if no DB record
    if (!payload) {
      const demoAccount = BUILTIN_DEMO_USERS[normalizedEmail];
      if (demoAccount && demoAccount.password === password) {
        payload = {
          id: demoAccount.id,
          email: demoAccount.email,
          name: demoAccount.name,
          role: demoAccount.role,
          department: demoAccount.department,
          propertyIds: demoAccount.propertyIds,
          avatarUrl: demoAccount.avatarUrl,
        };
      }
    }

    if (!payload) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = await signToken(payload);

    const response = NextResponse.json({
      success: true,
      user: payload,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[auth/login] Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
