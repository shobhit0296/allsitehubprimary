/**
 * app/api/[panel]/sites/logo-refresh/route.ts
 *
 * Admin-only endpoint. Force-refreshes the logo for a specific site.
 *
 * POST /api/[panel]/sites/logo-refresh
 * Body: { siteId: string } | { domain: string }
 *
 * Response:
 *   { success: true, faviconUrl: "/logos/example_com.png" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { autoFetch4KLogo } from '@/lib/logo-fetcher';
import { isAdminRequest, isPanelSegment } from '@/lib/admin-auth';

export const runtime = 'nodejs';

type Params = { params: Promise<{ panel: string }> };

const NOT_FOUND  = () => new NextResponse(null, { status: 404 });
const UNAUTHORIZED = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function POST(req: NextRequest, { params }: Params) {
  const { panel } = await params;
  if (!isPanelSegment(panel)) return NOT_FOUND();
  if (!isAdminRequest(req)) return UNAUTHORIZED();

  const body = await req.json() as { siteId?: string; domain?: string };
  const { siteId, domain: rawDomain } = body;

  if (!siteId && !rawDomain) {
    return NextResponse.json({ error: 'siteId or domain is required' }, { status: 400 });
  }

  const db = await readDB();
  const site = siteId
    ? db.sites.find(s => s.id === siteId)
    : db.sites.find(s => s.domain === rawDomain);

  const domain = site?.domain ?? rawDomain;
  if (!domain) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 });
  }

  // Force re-fetch (deletes cached file first)
  const newLogoPath = await autoFetch4KLogo(domain, /* force= */ true);
  const faviconUrl = newLogoPath
    ?? `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;

  // Persist the new faviconUrl in the database if we have a site record
  if (site) {
    const idx = db.sites.findIndex(s => s.id === site.id);
    if (idx !== -1) {
      db.sites[idx] = { ...db.sites[idx], faviconUrl };
      await writeDB(db);
    }
  }

  return NextResponse.json({ success: true, faviconUrl, domain });
}
