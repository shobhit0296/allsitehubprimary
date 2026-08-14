/**
 * scripts/fetch-all-db-logos.mjs
 * Reads ALL sites from Redis DB, downloads logos for every site
 * that doesn't already have a valid local /logos/ file, then
 * updates Redis with the new local paths.
 */

import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// ── Load .env.local ───────────────────────────────────────────────────────────
const envVars = fs.readFileSync(path.join(projectRoot, '.env.local'), 'utf8')
  .split('\n').filter(l => l.trim() && !l.startsWith('#'))
  .reduce((acc, line) => {
    const eq = line.indexOf('=');
    if (eq === -1) return acc;
    acc[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    return acc;
  }, {});

const REDIS_URL   = envVars.KV_REST_API_URL;
const REDIS_TOKEN = envVars.KV_REST_API_TOKEN;
const REDIS_KEY   = 'tbcpl-app:db';
const LOGO_DIR    = path.join(projectRoot, 'public', 'logos');
const MIN_BYTES   = 200;
const TIMEOUT_MS  = 12000;

if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true });

// ── Helpers ───────────────────────────────────────────────────────────────────

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
      }, response => {
        if ([301, 302, 307, 308].includes(response.statusCode) && response.headers.location) {
          response.resume();
          let loc = response.headers.location;
          try { loc = loc.startsWith('http') ? loc : new URL(loc, url).toString(); } catch { return resolve(false); }
          return downloadFile(loc, dest, redirects + 1).then(resolve);
        }
        if (response.statusCode !== 200) { response.resume(); return resolve(false); }
        const ct = response.headers['content-type'] ?? '';
        const isImage = ct.startsWith('image/') || ct.includes('svg') || ct.includes('octet-stream') || ct.includes('ico');
        if (!isImage && !dest.endsWith('.ico')) { response.resume(); return resolve(false); }
        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => file.close(() => {
          try {
            if (fs.existsSync(dest) && fs.statSync(dest).size >= MIN_BYTES) resolve(true);
            else { fs.unlink(dest, () => {}); resolve(false); }
          } catch { resolve(false); }
        }));
        file.on('error', () => { try { fs.unlink(dest, () => {}); } catch {} resolve(false); });
      });
      req.on('error', () => { try { fs.unlink(dest, () => {}); } catch {} resolve(false); });
      req.setTimeout(TIMEOUT_MS, () => { req.destroy(); try { fs.unlink(dest, () => {}); } catch {} resolve(false); });
    } catch { resolve(false); }
  });
}

function fetchHTML(url, redirects = 0) {
  return new Promise(resolve => {
    if (redirects > 5 || !url) return resolve(null);
    const client = url.startsWith('https') ? https : http;
    try {
      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      }, res => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          res.resume();
          let loc = res.headers.location;
          try { loc = loc.startsWith('http') ? loc : new URL(loc, url).toString(); } catch { return resolve(null); }
          return fetchHTML(loc, redirects + 1).then(resolve);
        }
        if (res.statusCode !== 200) { res.resume(); return resolve(null); }
        let data = '';
        res.on('data', chunk => {
          data += chunk;
          if (data.length > 300_000) { req.destroy(); resolve(data); }
        });
        res.on('end', () => resolve(data));
      });
      req.on('error', () => resolve(null));
      req.setTimeout(TIMEOUT_MS, () => { req.destroy(); resolve(null); });
    } catch { resolve(null); }
  });
}

function extractLogoUrls(html, baseUrl) {
  const candidates = [];
  const add = (url, score) => { if (url) candidates.push({ url, score }); };
  for (const m of html.matchAll(/<link[^>]+rel=["'](?:apple-touch-icon|apple-touch-icon-precomposed)["'][^>]+href=["']([^"']+)["']/gi)) add(m[1], 100);
  for (const m of html.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:apple-touch-icon|apple-touch-icon-precomposed)["']/gi)) add(m[1], 100);
  for (const m of html.matchAll(/<link[^>]+rel=["'](?:shortcut icon|icon)["'][^>]+sizes=["'](\d+)x\d+["'][^>]+href=["']([^"']+)["']/gi)) {
    const px = parseInt(m[1] ?? '0', 10); add(m[2], 50 + Math.min(px, 512));
  }
  for (const m of html.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]+sizes=["'](\d+)x\d+["'][^>]+rel=["'](?:shortcut icon|icon)["']/gi)) {
    const px = parseInt(m[2] ?? '0', 10); add(m[1], 50 + Math.min(px, 512));
  }
  for (const m of html.matchAll(/<link[^>]+rel=["'](?:shortcut icon|icon|mask-icon)["'][^>]+href=["']([^"']+)["']/gi)) add(m[1], 30);
  for (const m of html.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut icon|icon|mask-icon)["']/gi)) add(m[1], 30);
  for (const m of html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi)) add(m[1], 15);
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi)) add(m[1], 15);
  candidates.sort((a, b) => b.score - a.score);
  const resolved = candidates.map(c => { try { return new URL(c.url, baseUrl).toString(); } catch { return null; } }).filter(Boolean);
  try {
    const origin = new URL(baseUrl).origin;
    resolved.push(`${origin}/apple-touch-icon.png`, `${origin}/apple-touch-icon-precomposed.png`,
      `${origin}/favicon.ico`, `${origin}/favicon.png`, `${origin}/favicon-32x32.png`, `${origin}/favicon-192x192.png`);
  } catch {}
  return [...new Set(resolved)];
}

async function fetchAndCacheLogo(domain) {
  const clean = normalizeDomain(domain);
  if (!clean) return null;
  const stem = domainToStem(clean);
  const originUrl = `https://${clean}`;

  // Try HTML scraping first
  const html = await fetchHTML(originUrl);
  if (html) {
    const candidates = extractLogoUrls(html, originUrl);
    for (const candUrl of candidates) {
      const ext = candUrl.toLowerCase().includes('.svg') ? 'svg' : 'png';
      const dest = path.join(LOGO_DIR, `${stem}.${ext}`);
      if (await downloadFile(candUrl, dest)) return `/logos/${stem}.${ext}`;
    }
  }

  // Root path fallbacks
  const destPng = path.join(LOGO_DIR, `${stem}.png`);
  for (const url of [
    `${originUrl}/apple-touch-icon.png`,
    `${originUrl}/favicon.ico`,
    `${originUrl}/favicon.png`,
    `${originUrl}/favicon-32x32.png`,
  ]) {
    if (await downloadFile(url, destPng)) return `/logos/${stem}.png`;
  }

  // Google Favicons API fallback (256px)
  const googleUrl = `https://www.google.com/s2/favicons?domain=${clean}&sz=256`;
  if (await downloadFile(googleUrl, destPng)) return `/logos/${stem}.png`;

  return null;
}

// ── Redis helpers ─────────────────────────────────────────────────────────────

async function redisGet(key) {
  const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  const json = await res.json();
  return json.result;
}

async function redisSet(key, value) {
  const res = await fetch(`${REDIS_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
  return res.ok;
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('\nReading all sites from Redis DB...');
const raw = await redisGet(REDIS_KEY);
if (!raw) { console.error('DB not found in Redis'); process.exit(1); }
const db = typeof raw === 'string' ? JSON.parse(raw) : raw;
console.log(`Found ${db.sites.length} sites.\n`);

let fetched = 0, skipped = 0, failed = 0, dbUpdated = 0;

for (const site of db.sites) {
  const existing = getLocalLogo(site.domain);
  if (existing) {
    // Already has a valid local file — just make sure DB points to it
    if (site.faviconUrl !== existing) {
      site.faviconUrl = existing;
      dbUpdated++;
    }
    process.stdout.write(`  ⏭  ${(site.name || site.domain).slice(0, 20).padEnd(20)} ${existing}\n`);
    skipped++;
    continue;
  }

  process.stdout.write(`  ⏳ ${(site.name || site.domain).slice(0, 20).padEnd(20)} fetching...`);
  const result = await fetchAndCacheLogo(site.domain);
  if (result) {
    site.faviconUrl = result;
    dbUpdated++;
    fetched++;
    process.stdout.write(` ✅ ${result}\n`);
  } else {
    // Keep existing faviconUrl (Google fallback better than nothing)
    failed++;
    process.stdout.write(` ❌ failed — keeping: ${site.faviconUrl ?? 'none'}\n`);
  }
}

console.log(`\nLogos: ✅ ${fetched} fetched  ⏭  ${skipped} skipped  ❌ ${failed} failed`);
console.log(`DB:    ${dbUpdated} records to update\n`);

if (dbUpdated > 0) {
  console.log('Saving updated DB to Redis...');
  const ok = await redisSet(REDIS_KEY, db);
  console.log(ok ? `✅ DB saved — ${dbUpdated} records updated.\n` : '❌ Redis write failed!\n');
  if (!ok) process.exit(1);
} else {
  console.log('All sites already have correct local logos.\n');
}
