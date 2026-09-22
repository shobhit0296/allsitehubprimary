import { NextResponse } from 'next/server';
import { readDB } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
 
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
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Cloudflare-CDN-Cache-Control': 'no-store',
      },
    }
  );
}
