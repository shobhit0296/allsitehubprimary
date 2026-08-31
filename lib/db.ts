/**
 * lib/db.ts — persistence layer
 *
 * On Vercel, serverless functions run against a read-only filesystem
 * (except /tmp, which isn't shared between invocations and is wiped on
 * every cold start), so writing to data/db.json in production silently
 * loses every admin edit and can throw EROFS outright. When Redis env vars
 * are present (e.g. after connecting an Upstash/Vercel KV store) this
 * module persists to Redis instead; otherwise it falls back to the local
 * JSON file, which is fine for `next dev` / `next start` on a normal
 * filesystem.
 */
import { Redis } from '@upstash/redis';
import type { Site } from './data';

const REDIS_KEY = 'allsitehub:db';
const LEGACY_REDIS_KEY = 'tbcpl-app:db';

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

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

function seedData(): DB {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SITES, CATEGORIES, REGIONS } = require('./data') as typeof import('./data');
  return {
    sites: SITES,
    categories: CATEGORIES.map((c: { name: string }) => c.name),
    regions: REGIONS,
    requests: [],
  };
}

async function readDBRedis(): Promise<DB> {
  try {
    let data = await redis!.get<DB>(REDIS_KEY);
    if (!data) {
      const legacy = await redis!.get<DB>(LEGACY_REDIS_KEY);
      if (legacy) {
        data = legacy;
        try { await redis!.set(REDIS_KEY, legacy); } catch { /* ignore */ }
      }
    }
    if (!data) {
      const initial = seedData();
      try { await redis!.set(REDIS_KEY, initial); } catch { /* ignore */ }
      return initial;
    }
    if (!Array.isArray(data.requests)) data.requests = [];
    return data;
  } catch (err) {
    console.warn('[DB] Redis read failed, falling back to local file:', err);
    return readDBFs();
  }
}

async function writeDBRedis(data: DB): Promise<void> {
  try {
    await Promise.all([
      redis!.set(REDIS_KEY, data),
      redis!.set(LEGACY_REDIS_KEY, data),
    ]);
  } catch (err) {
    console.warn('[DB] Redis write failed, falling back to local file:', err);
    writeDBFs(data);
  }
}

function readDBFs(): DB {
  try {
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    if (!fs || typeof fs.existsSync !== 'function') return seedData();
    const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(DB_PATH)) {
      const initial = seedData();
      try { fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8'); } catch { /* ignore */ }
      return initial;
    }

    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) as DB;
    if (!Array.isArray(data.requests)) { data.requests = []; }
    return data;
  } catch {
    return seedData();
  }
}

function writeDBFs(data: DB): void {
  try {
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    if (!fs || typeof fs.writeFileSync !== 'function') return;
    const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // ignore in serverless/worker environments
  }
}

// Sites persisted before manual ranking existed have no `order` field.
// Backfill them per-category (matching the array position they already
// render in) and persist the backfill once so this only has to run once.
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
  const data = redis ? await readDBRedis() : readDBFs();
  if (ensureOrder(data)) await writeDB(data);
  return data;
}

export async function writeDB(data: DB): Promise<void> {
  return redis ? writeDBRedis(data) : writeDBFs(data);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
