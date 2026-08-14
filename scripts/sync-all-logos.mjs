/**
 * scripts/sync-all-logos.mjs
 * Syncs and verifies all logos for both data/db.json and Redis DB.
 * Ensures every single site has a valid local file in public/logos/ or valid faviconUrl.
 */

import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const LOGO_DIR = path.join(projectRoot, 'public', 'logos');
const DB_JSON_PATH = path.join(projectRoot, 'data', 'db.json');
const MIN_BYTES = 200;
const TIMEOUT = 10000;

// Load env
const envVars = fs.readFileSync(path.join(projectRoot, '.env.local'), 'utf8')
  .split('\n').filter(l => l.trim() && !l.startsWith('#'))
  .reduce((acc, line) => {
    const eq = line.indexOf('=');
    if (eq === -1) return acc;
    acc[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    return acc;
  }, {});

const REDIS_URL = envVars.KV_REST_API_URL;
const REDIS_TOKEN = envVars.KV_REST_API_TOKEN;
const REDIS_KEY = 'tbcpl-app:db';

function normalizeDomain(input) {
  let s = (input || '').trim();
  if (!s.startsWith('http://') && !s.startsWith('https://')) s = `https://${s}`;
  try { return new URL(s).hostname.replace(/^www\./, ''); }
  catch { return s.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase(); }
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

function downloadFile(url, dest, redirects = 0) {
  return new Promise(resolve => {
    if (redirects > 5 || !url) return resolve(false);
    const client = url.startsWith('https') ? https : http;
    try {
      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        }
      }, res => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          res.resume();
          let loc = res.headers.location;
          try { loc = loc.startsWith('http') ? loc : new URL(loc, url).toString(); } catch { return resolve(false); }
          return downloadFile(loc, dest, redirects + 1).then(resolve);
        }
        if (res.statusCode !== 200) { res.resume(); return resolve(false); }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(() => {
          try {
            if (fs.existsSync(dest) && fs.statSync(dest).size >= MIN_BYTES) resolve(true);
            else { fs.unlink(dest, () => {}); resolve(false); }
          } catch { resolve(false); }
        }));
        file.on('error', () => { try { fs.unlink(dest, () => {}); } catch {} resolve(false); });
      });
      req.on('error', () => resolve(false));
      req.setTimeout(TIMEOUT, () => { req.destroy(); resolve(false); });
    } catch { resolve(false); }
  });
}

async function ensureLogo(domain) {
  const clean = normalizeDomain(domain);
  if (!clean) return null;
  const existing = getLocalLogo(clean);
  if (existing) return existing;

  const stem = domainToStem(clean);
  const destPng = path.join(LOGO_DIR, `${stem}.png`);

  const fallbacks = [
    `https://${clean}/apple-touch-icon.png`,
    `https://${clean}/favicon.ico`,
    `https://${clean}/favicon.png`,
    `https://www.google.com/s2/favicons?domain=${clean}&sz=256`,
    `https://icon.horse/icon/${clean}`,
    `https://icons.duckduckgo.com/ip3/${clean}.ico`
  ];

  for (const url of fallbacks) {
    if (await downloadFile(url, destPng)) {
      return `/logos/${stem}.png`;
    }
  }
  return null;
}

const rGet = async (key) => (await (await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${REDIS_TOKEN}` } })).json()).result;
const rSet = async (key, val) => (await fetch(`${REDIS_URL}/set/${encodeURIComponent(key)}`, { method: 'POST', headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(val) })).ok;

console.log('--- 1. Processing data/db.json ---');
if (fs.existsSync(DB_JSON_PATH)) {
  const localDb = JSON.parse(fs.readFileSync(DB_JSON_PATH, 'utf8'));
  let localUpdated = 0;
  for (const site of localDb.sites || []) {
    const logo = await ensureLogo(site.domain);
    if (logo && site.faviconUrl !== logo) {
      site.faviconUrl = logo;
      localUpdated++;
    }
  }
  fs.writeFileSync(DB_JSON_PATH, JSON.stringify(localDb, null, 2), 'utf8');
  console.log(`Updated ${localUpdated} sites in data/db.json`);
}

console.log('\n--- 2. Processing Redis DB ---');
const rawRedis = await rGet(REDIS_KEY);
if (rawRedis) {
  const redisDb = typeof rawRedis === 'string' ? JSON.parse(rawRedis) : rawRedis;
  let redisUpdated = 0;
  for (const site of redisDb.sites || []) {
    const logo = await ensureLogo(site.domain);
    if (logo && site.faviconUrl !== logo) {
      site.faviconUrl = logo;
      redisUpdated++;
    }
  }
  if (redisUpdated > 0) {
    await rSet(REDIS_KEY, redisDb);
    console.log(`Updated ${redisUpdated} sites in Redis DB`);
  } else {
    console.log(`Redis DB is already completely in sync!`);
  }
}

console.log('\n--- Status Complete ---');
