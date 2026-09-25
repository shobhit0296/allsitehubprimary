import { NextResponse } from 'next/server';
import { readDB } from '@/lib/db';

export const dynamic = 'force-dynamic';
 
export async function GET() {
  const db = await readDB();
  return NextResponse.json(
    {
      sites: db.sites,
      categories: db.categories,
      regions: db.regions,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Cloudflare-CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=60',
      },
    }
  );
}
