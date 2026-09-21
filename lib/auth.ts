import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'one-directory-erp-secure-jwt-key-32-chars-minimum-token';
const key = new TextEncoder().encode(JWT_SECRET);
export const AUTH_COOKIE_NAME = 'od_auth_token';

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string | null;
  propertyIds: string[];
  avatarUrl?: string | null;
}

/**
 * Signs a JWT token with the given user payload
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

/**
 * Verifies a JWT token and returns the typed payload or null
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Hashes a plaintext password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares plaintext password with stored bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Extracts and verifies auth token from incoming NextRequest or headers
 */
export async function getSessionUser(req?: NextRequest | Request): Promise<TokenPayload | null> {
  let token: string | null = null;

  if (req) {
    // 1. Check Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Check Cookie header
    if (!token) {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }
  }

  // Fallback to Next.js cookies() API if available
  if (!token) {
    try {
      const cookieStore = await cookies();
      const cookie = cookieStore.get(AUTH_COOKIE_NAME);
      if (cookie) {
        token = cookie.value;
      }
    } catch {
      // cookies() might fail outside Next.js request context
    }
  }

  if (!token) return null;
  return verifyToken(token);
}

/**
 * Helper to enforce authentication & role check in API routes
 */
export async function requireAuth(
  req: NextRequest | Request,
  allowedRoles?: UserRole[]
): Promise<{ user: TokenPayload } | { error: string; status: number }> {
  const user = await getSessionUser(req);
  if (!user) {
    return { error: 'Authentication required. Please sign in.', status: 401 };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      error: `Forbidden: role '${user.role}' does not have permission to perform this action.`,
      status: 403,
    };
  }

  return { user };
}
