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

const REDIS_KEY = 'tbcpl-app:db';

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
  const data = await redis!.get<DB>(REDIS_KEY);
  if (!data) {
    const initial = seedData();
    await redis!.set(REDIS_KEY, initial);
    return initial;
  }
  if (!Array.isArray(data.requests)) data.requests = [];
  return data;
}

async function writeDBRedis(data: DB): Promise<void> {
  await redis!.set(REDIS_KEY, data);
}

function readDBFs(): DB {
  const fs = require('fs') as typeof import('fs');
  const path = require('path') as typeof import('path');
  const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(DB_PATH)) {
    const initial = seedData();
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }

  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) as DB;
  if (!Array.isArray(data.requests)) { data.requests = []; writeDBFs(data); }
  return data;
}

function writeDBFs(data: DB): void {
  const fs = require('fs') as typeof import('fs');
  const path = require('path') as typeof import('path');
  const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export async function readDB(): Promise<DB> {
  return redis ? readDBRedis() : readDBFs();
}

export async function writeDB(data: DB): Promise<void> {
  return redis ? writeDBRedis(data) : writeDBFs(data);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
