// lib/data.js
//
// On Vercel, serverless functions run against a read-only filesystem
// (except /tmp, which is not shared between invocations and is wiped on
// every cold start), so writing to data/db.json in production silently
// loses every admin edit and can throw EROFS outright. When Redis env vars
// are present (e.g. after connecting an Upstash/Vercel KV store) this
// module persists to Redis instead; otherwise it falls back to the local
// JSON file, which is fine for `next dev` / `next start` on a normal
// filesystem.
import { Redis } from '@upstash/redis';

const REDIS_KEY = 'tbcpl:db';

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Default structure
const defaultData = {
  sites: [],
  categories: ['Movies & Shows', 'Anime', 'Manga', 'Live TV & Sports'],
  regions: ['Global', 'US', 'UK', 'CA', 'AU', 'IN', 'DE', 'FR', 'JP'],
  onlineCount: 12,
};

async function readDataRedis() {
  const data = await redis.get(REDIS_KEY);
  if (!data) {
    await redis.set(REDIS_KEY, defaultData);
    return defaultData;
  }
  return data;
}

async function writeDataRedis(data) {
  await redis.set(REDIS_KEY, data);
}

async function readDataFs() {
  const fs = await import('fs');
  const path = await import('path');
  const dataFilePath = path.join(process.cwd(), 'data', 'db.json');
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify(defaultData, null, 2));
  }
  const raw = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(raw);
}

async function writeDataFs(data) {
  const fs = await import('fs');
  const path = await import('path');
  const dataFilePath = path.join(process.cwd(), 'data', 'db.json');
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export async function readData() {
  return redis ? readDataRedis() : readDataFs();
}

export async function writeData(data) {
  return redis ? writeDataRedis(data) : writeDataFs(data);
}

// Helper to generate a short ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
