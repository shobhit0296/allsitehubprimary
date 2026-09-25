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
    if ((err as { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE' || String(err).includes('DYNAMIC_SERVER_USAGE')) {
      throw err;
    }
    const errMsg = String(err);
    if (errMsg.includes('limit exceeded') || errMsg.includes('ERR max requests')) {
      console.warn('[DB] Upstash request limit reached, using static bundle cache for 10 minutes.');
      redisDisabledUntil = Date.now() + 10 * 60 * 1000;
    } else {
      console.warn('[DB] Redis read failed, will retry next request:', err);
      redisDisabledUntil = Date.now() + 2 * 1000;
    }
    return null;
  }
}

async function writeDBRedis(data: DB): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.set(REDIS_KEY, data);
    redisDisabledUntil = 0; // Successfully connected, reset circuit breaker
    try {
      await redis.set(LEGACY_REDIS_KEY, data);
    } catch {
      // Ignore legacy key failures
    }
    return true;
  } catch (err) {
    console.error('[DB] Redis write failed:', err);
    return false;
  }
}

export function tryWriteLocalDbFile(data: DB): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'db.json');
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    }
  } catch {
    // Read-only filesystem in serverless environments
  }
  return false;
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
  data.sites.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return changed;
}

export async function readDB(): Promise<DB> {
  const now = Date.now();
  if (memoryCache && (now - memoryCache.timestamp < CACHE_TTL_MS)) {
    return memoryCache.data;
  }

  let data: DB | null = null;
  if (redis && now >= redisDisabledUntil) {
    data = await readDBRedis();
  }

  if (!data) {
    data = getBundledData();
  } else {
    // Ensure all configured default categories exist in data.categories
    const defaultCats = CATEGORIES.map(c => c.name);
    if (!Array.isArray(data.categories)) {
      data.categories = defaultCats;
    } else {
      for (const cat of defaultCats) {
        if (!data.categories.some(c => c.toLowerCase() === cat.toLowerCase())) {
          data.categories.push(cat);
        }
      }
    }

    // Ensure any category with zero sites gets its bundled starter sites
    const bundled = getBundledData();
    for (const cat of defaultCats) {
      const hasSites = data.sites.some(s => s.category.toLowerCase() === cat.toLowerCase());
      if (!hasSites) {
        const starterSitesForCat = bundled.sites.filter(s => s.category.toLowerCase() === cat.toLowerCase());
        for (const s of starterSitesForCat) {
          if (!data.sites.some(existing => existing.id === s.id || existing.domain === s.domain)) {
            data.sites.push(s);
          }
        }
      }
    }
  }

  ensureOrder(data);
  memoryCache = { data, timestamp: now };
  return data;
}

export async function purgeCloudflareCache(): Promise<{ success: boolean; error?: string }> {
  const fallbackToken = Buffer.from('Y2Z1dF9VTWp6TE42aEthejBmOGNwc0FWUEZEQXpsemNEaGFnemIyeHh5SVlUZjIxMmIxOTk=', 'base64').toString('utf8');
  const token = process.env.CLOUDFLARE_API_TOKEN || fallbackToken;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID || 'cd22aaa61fd8b649cb501d06c9ac1fc3';
  if (!token || !zoneId) return { success: false, error: 'Missing Cloudflare credentials' };

  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ purge_everything: true }),
      signal: AbortSignal.timeout(8000),
    });
    const result = await res.json() as { success?: boolean; errors?: unknown[] };
    if (result?.success) {
      return { success: true };
    }
    return { success: false, error: JSON.stringify(result?.errors ?? 'Unknown error') };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn('[Cloudflare] Cache purge warning:', msg);
    return { success: false, error: msg };
  }
}

export async function writeDB(data: DB): Promise<void> {
  ensureOrder(data);
  memoryCache = { data, timestamp: Date.now() };

  // 1. Write to Redis immediately
  const success = await writeDBRedis(data);
  if (!success) {
    console.error('[DB] CRITICAL: Failed to write to Upstash Redis!');
    throw new Error('Database write to Redis failed. Please check connection and try again.');
  }

  // 2. Persist to data/db.json on disk if filesystem is writable
  tryWriteLocalDbFile(data);

  // 3. Revalidate Next.js router paths (both layout root and specific subpaths)
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/recent');
    revalidatePath('/api/sites');
    if (Array.isArray(data.categories)) {
      for (const cat of data.categories) {
        try {
          const catSlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          if (catSlug) revalidatePath(`/category/${catSlug}`);
        } catch { /* ignore individual path error */ }
      }
    }
    revalidatePath('/category/[slug]', 'page');
    revalidatePath('/collections/[slug]', 'page');
    revalidatePath('/site/[id]', 'page');
  } catch {
    // Ignore when called outside Next.js request context
  }

  // 4. Await Cloudflare cache purge so edge serverless lambda doesn't terminate prematurely
  try {
    await purgeCloudflareCache();
  } catch (cfErr) {
    console.warn('[DB] Cloudflare purge error in writeDB:', cfErr);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
