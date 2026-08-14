import crypto from 'crypto';
import type { NextRequest } from 'next/server';

export const ADMIN_COOKIE = 'ash_admin';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000; // 15 min
const attempts = new Map<string, { count: number; lockUntil: number }>();

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET env var is not set');
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
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error('ADMIN_PASSWORD env var is not set');
  const inputBuf = Buffer.from(input);
  const expectedBuf = Buffer.from(expected);
  const paddedInput = Buffer.concat([inputBuf, Buffer.alloc(Math.max(0, expectedBuf.length - inputBuf.length))]);
  const matchesLength = inputBuf.length === expectedBuf.length;
  const bytesMatch = crypto.timingSafeEqual(paddedInput.subarray(0, expectedBuf.length), expectedBuf);
  return matchesLength && bytesMatch;
}

/** Simple per-IP brute-force lockout for the login endpoint. */
export function isLoginLocked(ip: string): boolean {
  const rec = attempts.get(ip);
  return !!rec && Date.now() < rec.lockUntil;
}

export function recordLoginFailure(ip: string): void {
  const rec = attempts.get(ip) ?? { count: 0, lockUntil: 0 };
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockUntil = Date.now() + LOCK_MS;
    rec.count = 0;
  }
  attempts.set(ip, rec);
}

export function recordLoginSuccess(ip: string): void {
  attempts.delete(ip);
}

export function requestIp(req: NextRequest): string {
  return req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
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
  const panel = process.env.ADMIN_PANEL_PATH;
  if (!panel || !segment) return false;
  const a = Buffer.from(segment);
  const b = Buffer.from(panel);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
