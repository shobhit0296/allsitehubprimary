/**
 * scripts/update-db-logos.mjs
 * Updates the Redis DB so every site's faviconUrl points to its local /logos/ file.
 * Run ONCE after fetch-missing-logos.mjs has downloaded all logos.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Load .env.local
const envFile = path.join(projectRoot, '.env.local');
const envVars = fs.readFileSync(envFile, 'utf8')
  .split('\n')
  .filter(l => l.trim() && !l.startsWith('#'))
  .reduce((acc, line) => {
    const eq = line.indexOf('=');
    if (eq === -1) return acc;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    acc[key] = val;
    return acc;
  }, {});

process.env.KV_REST_API_URL    = envVars.KV_REST_API_URL;
process.env.KV_REST_API_TOKEN  = envVars.KV_REST_API_TOKEN;

const LOGO_DIR    = path.join(projectRoot, 'public', 'logos');
const REDIS_KEY   = 'tbcpl-app:db';
const MIN_BYTES   = 200;

function normalizeDomain(input) {
  let s = input.trim();
  if (!s.startsWith('http://') && !s.startsWith('https://')) s = `https://${s}`;
  try { return new URL(s).hostname.replace(/^www\./, ''); }
  catch { return input.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase(); }
}

function domainToStem(domain) {
  return domain.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function getLocalLogo(domain) {
  const stem = domainToStem(normalizeDomain(domain));
  for (const ext of ['png', 'svg', 'ico', 'webp']) {
    const abs = path.join(LOGO_DIR, `${stem}.${ext}`);
    if (fs.existsSync(abs) && fs.statSync(abs).size >= MIN_BYTES) return `/logos/${stem}.${ext}`;
  }
  return null;
}

// ── Minimal Redis client using the Upstash REST API ──────────────────────────

async function redisGet(key) {
  const res = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
  });
  const json = await res.json();
  return json.result;
}

async function redisSet(key, value) {
  const res = await fetch(`${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(value),
  });
  return res.ok;
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log('\nReading DB from Redis...');
const raw = await redisGet(REDIS_KEY);
if (!raw) { console.error('DB not found in Redis'); process.exit(1); }

const db = typeof raw === 'string' ? JSON.parse(raw) : raw;
console.log(`Found ${db.sites.length} sites.\n`);

let updated = 0;
let alreadyLocal = 0;
let noLogo = 0;

for (const site of db.sites) {
  if (site.faviconUrl?.startsWith('/logos/')) {
    alreadyLocal++;
    continue;
  }
  const localLogo = getLocalLogo(site.domain);
  if (localLogo) {
    console.log(`  ✅ ${site.name.padEnd(20)} ${site.faviconUrl ?? '(none)'} → ${localLogo}`);
    site.faviconUrl = localLogo;
    updated++;
  } else {
    console.log(`  ⚠️  ${site.name.padEnd(20)} no local logo found — keeping existing`);
    noLogo++;
  }
}

console.log(`\n${updated} sites to update, ${alreadyLocal} already local, ${noLogo} no local logo.\n`);

if (updated > 0) {
  console.log('Writing updated DB back to Redis...');
  const ok = await redisSet(REDIS_KEY, db);
  if (ok) {
    console.log(`✅ Done! ${updated} faviconUrl fields updated to local /logos/ paths.\n`);
  } else {
    console.error('❌ Redis write failed!');
    process.exit(1);
  }
} else {
  console.log('Nothing to update — all sites already use local logos.\n');
}
