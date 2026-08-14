/**
 * app/api/logo/route.ts
 *
 * Public (no auth required) logo resolution endpoint.
 *
 * GET /api/logo?url=https://example.com
 *
 * Response (success):
 *   { success: true, logo: "/logos/example_com.png", source: "local-cache" }
 *
 * Response (fallback to external service):
 *   { success: true, logo: "https://www.google.com/s2/favicons?domain=example.com&sz=256", source: "google-favicon" }
 *
 * Response (error):
 *   { success: false, error: "..." }
 */

import { NextRequest, NextResponse } from 'next/server';
import { autoFetch4KLogo, getCachedLogoPath, normalizeDomain } from '@/lib/logo-fetcher';

// Simple in-memory cache to avoid hammering external sites on repeated requests.
// In production with multiple serverless instances, each instance has its own cache
// (acceptable — the disk cache in public/logos/ is the durable layer).
const memCache = new Map<string, { logo: string; source: string; at: number }>();
const MEM_TTL_MS = 60 * 60 * 1000; // 1 hour

export const runtime = 'nodejs'; // needs fs, https — cannot run on Edge

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url') ?? req.nextUrl.searchParams.get('domain');
  if (!rawUrl) {
    return NextResponse.json(
      { success: false, error: 'Missing required query param: url' },
      { status: 400 },
    );
  }

  const domain = normalizeDomain(rawUrl);
  if (!domain) {
    return NextResponse.json(
      { success: false, error: 'Could not parse a valid hostname from the provided url' },
      { status: 400 },
    );
  }

  // 1. Check memory cache first
  const cached = memCache.get(domain);
  if (cached && Date.now() - cached.at < MEM_TTL_MS) {
    return NextResponse.json(
      { success: true, logo: cached.logo, source: cached.source, cached: true },
      { headers: { 'Cache-Control': 'public, max-age=3600' } },
    );
  }

  // 2. Check local disk cache
  const localPath = getCachedLogoPath(domain);
  if (localPath) {
    const result = { logo: localPath, source: 'local-cache' as const };
    memCache.set(domain, { ...result, at: Date.now() });
    return NextResponse.json(
      { success: true, ...result },
      { headers: { 'Cache-Control': 'public, max-age=3600' } },
    );
  }

  // 3. Try to fetch and cache the logo server-side
  try {
    const fetched = await autoFetch4KLogo(domain);
    if (fetched) {
      const result = { logo: fetched, source: 'fetched' as const };
      memCache.set(domain, { ...result, at: Date.now() });
      return NextResponse.json(
        { success: true, ...result },
        { headers: { 'Cache-Control': 'public, max-age=3600' } },
      );
    }
  } catch {
    // Fetch failed — fall through to external fallback
  }

  // 4. External fallback: return a Google Favicons API URL (no local download)
  const googleLogo = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
  const fallbackResult = { logo: googleLogo, source: 'google-favicon' as const };
  memCache.set(domain, { ...fallbackResult, at: Date.now() });

  return NextResponse.json(
    { success: true, ...fallbackResult },
    { headers: { 'Cache-Control': 'public, max-age=1800' } },
  );
}
