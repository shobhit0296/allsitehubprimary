import { NextRequest, NextResponse } from 'next/server';
import { readDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const isBust = req.nextUrl.searchParams.has('_t');
  const db = await readDB();

  return NextResponse.json(
    {
      sites: db.sites,
      categories: db.categories,
      regions: db.regions,
    },
    {
      headers: isBust
        ? {
            'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
            'CDN-Cache-Control': 'no-store',
            'Cloudflare-CDN-Cache-Control': 'no-store',
          }
        : {
            'Cache-Control': 'public, max-age=0, s-maxage=15, stale-while-revalidate=60',
            'CDN-Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
            'Cloudflare-CDN-Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
          },
    }
  );
}
