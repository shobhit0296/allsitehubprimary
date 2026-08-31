/**
 * app/api/stats/visitors/route.ts
 *
 * All-time active users tracker for GA4 property 546801810.
 * Computes base active users starting from 128,450 with daily random ~25,000 growth
 * and adds live session tracking from Upstash Redis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateAllTimeActiveUsers } from '@/lib/activeUsers';

export const runtime = 'nodejs';

const REDIS_URL = process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN;
const REDIS_KEY = 'allsitehub:stats:live_session_increments';

async function redisGet(key: string): Promise<number> {
  if (!REDIS_URL || !REDIS_TOKEN) return 0;
  try {
    const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(1500),
    });
    const json = await res.json();
    if (json.result !== null && json.result !== undefined) {
      const num = Number(json.result);
      return Number.isFinite(num) ? num : 0;
    }
  } catch {
    // ignore
  }
  return 0;
}

async function redisIncrBy(key: string, by: number): Promise<number> {
  if (!REDIS_URL || !REDIS_TOKEN) return 0;
  try {
    const res = await fetch(`${REDIS_URL}/incrby/${encodeURIComponent(key)}/${by}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(1500),
    });
    const json = await res.json();
    return typeof json.result === 'number' ? json.result : 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  const baseCount = calculateAllTimeActiveUsers();
  const increments = await redisGet(REDIS_KEY);

  const totalUsers = baseCount + increments;

  return NextResponse.json({
    success: true,
    totalUsers,
    propertyId: '546801810',
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60' }
  });
}

export async function POST(req: NextRequest) {
  const baseCount = calculateAllTimeActiveUsers();
  const increments = await redisIncrBy(REDIS_KEY, 1);

  const totalUsers = baseCount + increments;

  return NextResponse.json({
    success: true,
    totalUsers,
    propertyId: '546801810',
  });
}
