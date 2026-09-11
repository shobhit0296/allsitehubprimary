/**
 * lib/db.ts — persistence layer with in-memory caching & rate-limit resilience
 */
import { Redis } from '@upstash/redis';
import { revalidatePath } from 'next/cache';
import type { Site } from './data';
import { SITES, CATEGORIES, REGIONS } from './data';
import bundledDbJson from '@/data/db.json';

const REDIS_KEY = 'allsitehub:db';
const LEGACY_REDIS_KEY = 'tbcpl-app:db';

const DEFAULT_KV_URL = "https://tight-katydid-177010.upstash.io";
const DEFAULT_KV_TOKEN = "gQAAAAAAArNyAAIgcDI4NzA1NzRjMTUzMDI0MzRlYTgyZWJlMjhiNDk1NzAxNQ";

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || DEFAULT_KV_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || DEFAULT_KV_TOKEN;
const redis = new Redis({ url: redisUrl, token: redisToken });

// Circuit breaker: if Upstash hits monthly request limit or errors out,
// skip Redis for 5 minutes so workers don't exceed CPU limits with failing network calls.
let redisDisabledUntil = 0;

// In-memory cache for ultra-fast SSR execution (0ms) on workers/serverless
let memoryCache: { data: DB; timestamp: number } | null = null;
const CACHE_TTL_MS = 5_000; // 5s memory cache for fast live updates

export interface SiteRequest {
  id: string;
  siteName: string;
  siteUrl: string;
  targets: Array<{ region: string; category: string }>;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
}

export interface DB {
  sites: Site[];
  categories: string[];
  regions: string[];
  requests: SiteRequest[];
}

function getBundledData(): DB {
  try {
    const raw = bundledDbJson as unknown as Partial<DB>;
    if (Array.isArray(raw?.sites) && raw.sites.length > 0) {
      return {
        sites: raw.sites,
        categories: Array.isArray(raw.categories) ? raw.categories : CATEGORIES.map(c => c.name),
        regions: Array.isArray(raw.regions) ? raw.regions : REGIONS,
        requests: Array.isArray(raw.requests) ? raw.requests : [],
      };
    }
  } catch {
    // fallback
  }

  return {
    sites: SITES,
    categories: CATEGORIES.map(c => c.name),
    regions: REGIONS,
    requests: [],
  };
}

async function readDBRedis(): Promise<DB | null> {
  if (!redis || Date.now() < redisDisabledUntil) return null;

  try {
    let data = await redis.get<DB>(REDIS_KEY);
    if (!data) {
      const legacy = await redis.get<DB>(LEGACY_REDIS_KEY);
      if (legacy) {
        data = legacy;
        try { await redis.set(REDIS_KEY, legacy); } catch { /* ignore */ }
      }
    }
    if (!data) {
      const initial = getBundledData();
      try { await redis.set(REDIS_KEY, initial); } catch { /* ignore */ }
      return initial;
    }
    if (!Array.isArray(data.requests)) data.requests = [];
    return data;
  } catch (err: unknown) {
    const errMsg = String(err);
    if (errMsg.includes('limit exceeded') || errMsg.includes('ERR max requests')) {
      console.warn('[DB] Upstash request limit reached, using static bundle cache for 10 minutes.');
      redisDisabledUntil = Date.now() + 10 * 60 * 1000;
    } else {
      console.warn('[DB] Redis read failed, temporarily bypassing Redis for 2 minutes:', err);
      redisDisabledUntil = Date.now() + 2 * 60 * 1000;
    }
    return null;
  }
}

async function writeDBRedis(data: DB): Promise<void> {
  if (!redis || Date.now() < redisDisabledUntil) return;
  try {
    await Promise.all([
      redis.set(REDIS_KEY, data),
      redis.set(LEGACY_REDIS_KEY, data),
    ]);
  } catch {
    redisDisabledUntil = Date.now() + 2 * 60 * 1000;
  }
}

function ensureOrder(data: DB): boolean {
  let changed = false;
  const counters: Record<string, number> = {};
  for (const site of data.sites) {
    if (typeof site.order !== 'number') {
      const order = counters[site.category] ?? 0;
      site.order = order;
      counters[site.category] = order + 1;
      changed = true;
    } else {
      counters[site.category] = Math.max(counters[site.category] ?? 0, site.order + 1);
    }
  }
  return changed;
}

export async function readDB(): Promise<DB> {
  const now = Date.now();
  if (memoryCache && (now - memoryCache.timestamp < CACHE_TTL_MS)) {
    return memoryCache.data;
  }

  // During static build / prerender, use fast bundled dataset to enable clean SSG
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.npm_lifecycle_event === 'build') {
    const staticData = getBundledData();
    ensureOrder(staticData);
    return staticData;
  }

  let data: DB | null = null;
  if (redis && now >= redisDisabledUntil) {
    data = await readDBRedis();
  }

  if (!data) {
    data = getBundledData();
  }

  ensureOrder(data);
  memoryCache = { data, timestamp: now };
  return data;
}

export async function writeDB(data: DB): Promise<void> {
  memoryCache = { data, timestamp: Date.now() };
  if (redis && Date.now() >= redisDisabledUntil) {
    await writeDBRedis(data);
  }
  try {
    revalidatePath('/', 'layout');
  } catch {
    // Ignore when called outside Next.js request context
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
