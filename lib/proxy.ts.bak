import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE, isPanelSegment, verifySessionToken } from '@/lib/admin-auth';

/**
 * The admin panel has no fixed "/admin" path — it only exists at whatever
 * secret slug is set in ADMIN_PANEL_PATH. Anything else under that first
 * segment is treated as a normal (non-existent) route, so scanners probing
 * "/admin" see the same 404 as any other made-up path.
 *
 * This is defense-in-depth: each route handler under app/[panel]/... and
 * app/api/[panel]/... verifies the panel + session itself too, since Proxy
 * coverage can silently drop if a route ever moves.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);

  const isApi = segments[0] === 'api';
  const panelSegment = isApi ? segments[1] : segments[0];
  if (!isPanelSegment(panelSegment)) return NextResponse.next();

  const isAuthRoute = isApi ? segments[2] === 'auth' : segments[1] === 'login';
  if (isAuthRoute) return NextResponse.next();

  const authed = verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value);
  if (authed) return NextResponse.next();

  if (isApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.redirect(new URL(`/${panelSegment}/login`, request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
