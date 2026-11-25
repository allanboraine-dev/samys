import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getExpectedPasscode,
  verifyAdminSessionToken,
} from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authenticated = verifyAdminSessionToken(token);
  return NextResponse.json({ authenticated });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { passcode?: string };
    const submitted = (body.passcode || '').trim();
    const expected = getExpectedPasscode();

    if (!submitted || submitted !== expected) {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid manager passcode.' },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();
    const res = NextResponse.json({ authenticated: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hours
    });
    return res;
  } catch {
    return NextResponse.json(
      { authenticated: false, error: 'Invalid request.' },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
