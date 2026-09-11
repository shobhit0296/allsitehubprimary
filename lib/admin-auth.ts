import crypto from 'crypto';
import type { NextRequest } from 'next/server';

export const ADMIN_COOKIE = 'ash_admin';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000; // 15 min
const attempts = new Map<string, { count: number; lockUntil: number }>();

const DEFAULT_PANEL_PATH = 'adminshobhit';
const DEFAULT_PASSWORD = 'shobhitallsitehubadmin8115591448';
const DEFAULT_SESSION_SECRET = 'a15301313959f1cba07e6b5ee7e46b229aa55d31a0f3b6ab523c839f538c9f36';

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || DEFAULT_SESSION_SECRET;
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Issue a signed, expiring session token (stateless — no server-side storage needed). */
export function createSessionToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!payload || !sig) return false;
  if (!safeEqualHex(sig, sign(payload))) return false;
  const expires = Number(payload);
  return Number.isFinite(expires) && Date.now() < expires;
}

/** Constant-time password comparison against the ADMIN_PASSWORD env var. */
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  const inputBuf = Buffer.from(input);
  const expectedBuf = Buffer.from(expected);
  const paddedInput = Buffer.concat([inputBuf, Buffer.alloc(Math.max(0, expectedBuf.length - inputBuf.length))]);
  const matchesLength = inputBuf.length === expectedBuf.length;
  const bytesMatch = crypto.timingSafeEqual(paddedInput.subarray(0, expectedBuf.length), expectedBuf);
  return matchesLength && bytesMatch;
}

import { Redis } from '@upstash/redis';

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

/** Distributed per-IP brute-force lockout for login with in-memory fallback. */
export async function isLoginLocked(ip: string): Promise<boolean> {
  const memRec = attempts.get(ip);
  if (memRec && Date.now() < memRec.lockUntil) return true;

  if (redis) {
    try {
      const locked = await redis.get<number>(`ratelimit:login:lock:${ip}`);
      if (locked) return true;
    } catch {
      // fallback to memory
    }
  }
  return false;
}

export async function recordLoginFailure(ip: string): Promise<void> {
  // In-memory record
  const rec = attempts.get(ip) ?? { count: 0, lockUntil: 0 };
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockUntil = Date.now() + LOCK_MS;
    rec.count = 0;
  }
  attempts.set(ip, rec);

  // Redis distributed record
  if (redis) {
    try {
      const failKey = `ratelimit:login:fail:${ip}`;
      const fails = await redis.incr(failKey);
      if (fails === 1) {
        await redis.expire(failKey, 900); // 15 min window
      }
      if (fails >= MAX_ATTEMPTS) {
        await redis.set(`ratelimit:login:lock:${ip}`, 1, { ex: 900 });
        await redis.del(failKey);
      }
    } catch {
      // ignore redis errors
    }
  }
}

export async function recordLoginSuccess(ip: string): Promise<void> {
  attempts.delete(ip);
  if (redis) {
    try {
      await Promise.all([
        redis.del(`ratelimit:login:fail:${ip}`),
        redis.del(`ratelimit:login:lock:${ip}`),
      ]);
    } catch {
      // ignore
    }
  }
}

export function requestIp(req: NextRequest): string {
  return (
    req.headers.get('x-vercel-ip') ??
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

/** Verify the admin session cookie on an incoming request. Use in every protected route handler. */
export function isAdminRequest(req: NextRequest): boolean {
  return verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value);
}

/**
 * The admin panel lives at a secret, non-guessable path instead of the
 * well-known "/admin". This checks a URL segment against that secret
 * (constant-time, since it's effectively a second credential). Any
 * mismatch must be treated as if the route doesn't exist (404), not 401 —
 * a 401 would confirm to a scanner that something lives at that path.
 */
export function isPanelSegment(segment: string | undefined): boolean {
  if (!segment) return false;
  const configured = process.env.ADMIN_PANEL_PATH?.trim();
  const validPaths = new Set<string>();
  if (configured) validPaths.add(configured);
  validPaths.add(DEFAULT_PANEL_PATH);
  validPaths.add('shobhitadmin');

  for (const path of validPaths) {
    const a = Buffer.from(segment);
    const b = Buffer.from(path);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      return true;
    }
  }
  return false;
}
