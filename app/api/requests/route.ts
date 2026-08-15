import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB, generateId } from '@/lib/db';
import type { SiteRequest } from '@/lib/db';
import { requestIp } from '@/lib/admin-auth';

import { Redis } from '@upstash/redis';

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

/* ── Rate Limiting (Distributed Redis + in-memory fallback per IP) ── */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;
const ipSubmissions = new Map<string, { count: number; resetAt: number }>();

async function checkRateLimit(ip: string): Promise<boolean> {
  const now = Date.now();
  const record = ipSubmissions.get(ip);
  if (record && now <= record.resetAt && record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  if (redis) {
    try {
      const key = `ratelimit:requests:${ip}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, 600); // 10 min TTL
      }
      if (count > MAX_REQUESTS_PER_WINDOW) {
        return false;
      }
      return true;
    } catch {
      // fallback to memory
    }
  }

  if (!record || now > record.resetAt) {
    ipSubmissions.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  record.count += 1;
  return true;
}

/* Helper to strip HTML / Script tags to prevent XSS injection */
function sanitizeText(text: string): string {
  return text.replace(/<[^>]*>?/gm, '').trim();
}

/* Public POST — submit a site request with Anti-Bot & Security Hardening */
export async function POST(req: NextRequest) {
  const ip = requestIp(req);

  // 1. Rate Limiting Check
  if (!(await checkRateLimit(ip))) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a few minutes before trying again.' },
      { status: 429 }
    );
  }

  const body = await req.json() as Partial<SiteRequest> & { hp_field?: string };

  // 2. Honeypot Anti-Bot Trap Check
  // Automated spam bots auto-fill invisible fields. If hp_field contains data, silently drop!
  if (body.hp_field && body.hp_field.trim().length > 0) {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  const rawName = body.siteName?.trim();
  const rawUrl = body.siteUrl?.trim();

  if (!rawName || !rawUrl) {
    return NextResponse.json({ error: 'Site URL and name are required.' }, { status: 400 });
  }

  // 3. Strict Input Length Limits
  if (rawName.length > 70) {
    return NextResponse.json({ error: 'Site name must be under 70 characters.' }, { status: 400 });
  }
  if (rawUrl.length > 250) {
    return NextResponse.json({ error: 'Site URL must be under 250 characters.' }, { status: 400 });
  }

  // 4. Strict Protocol & Scheme Validation (only http:// or https:// allowed — blocks javascript:, data:, file:)
  let cleanUrl = rawUrl;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return NextResponse.json({ error: 'Invalid URL protocol. Only http:// and https:// URLs are accepted.' }, { status: 400 });
    }
    cleanUrl = parsed.href;
  } catch {
    return NextResponse.json({ error: 'Please enter a valid site URL starting with https:// or http://' }, { status: 400 });
  }

  // 5. XSS Sanitization
  const cleanName = sanitizeText(rawName);
  const cleanReason = body.reason ? sanitizeText(body.reason).slice(0, 500) : '';

  // 6. Target Sanitization (max 5 targets)
  const rawTargets = Array.isArray(body.targets) ? body.targets.slice(0, 5) : [];
  const cleanTargets = rawTargets.map(t => ({
    region: sanitizeText(String(t.region || 'Global')).slice(0, 30),
    category: sanitizeText(String(t.category || 'Movies & Shows')).slice(0, 50),
  }));

  if (cleanTargets.length === 0) {
    cleanTargets.push({ region: 'Global', category: 'Movies & Shows' });
  }

  const db = await readDB();
  const newReq: SiteRequest = {
    id: generateId(),
    siteName: cleanName,
    siteUrl: cleanUrl,
    targets: cleanTargets,
    reason: cleanReason,
    status: 'pending',
    submittedAt: Date.now(),
  };

  db.requests.push(newReq);
  await writeDB(db);

  return NextResponse.json(newReq, { status: 201 });
}
