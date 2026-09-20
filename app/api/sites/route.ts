import { NextResponse } from 'next/server';
import { readDB } from '@/lib/db';

export const revalidate = 60;
 
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
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
