import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('[auth/me] Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
