import { NextResponse } from 'next/server';
import { readDB } from '@/lib/db';

export const revalidate = 300; // 5-minute CDN edge cache, instantly purged on admin writeDB
 
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
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Cloudflare-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}
