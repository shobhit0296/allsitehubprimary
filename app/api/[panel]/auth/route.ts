import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  checkPassword,
  createSessionToken,
  isLoginLocked,
  isPanelSegment,
  recordLoginFailure,
  recordLoginSuccess,
  requestIp,
} from '@/lib/admin-auth';

const MAX_AGE = 60 * 60 * 24; // 24h, matches SESSION_TTL_MS in lib/admin-auth
const NOT_FOUND = () => new NextResponse(null, { status: 404 });

type Params = { params: Promise<{ panel: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { panel } = await params;
  if (!isPanelSegment(panel)) return NOT_FOUND();

  const ip = requestIp(req);
  if (await isLoginLocked(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const { password } = await req.json().catch(() => ({ password: '' }));

  if (typeof password !== 'string' || !checkPassword(password)) {
    await recordLoginFailure(ip);
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  await recordLoginSuccess(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    maxAge: MAX_AGE,
    path: '/',
  });
  return res;
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { panel } = await params;
  if (!isPanelSegment(panel)) return NOT_FOUND();

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
