/**
 * scripts/cleanup-bad-logos.mjs
 * Removes oversized logos (>2MB — likely scraped OG images, not favicons)
 * and very small logos (<300 bytes — usually 1x1 pixel placeholders).
 * Also re-fetches replacements via Google Favicons API.
 */

import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const LOGO_DIR   = path.join(projectRoot, 'public', 'logos');
const MIN_BYTES  = 300;
const MAX_BYTES  = 1_500_000; // 1.5MB max — real logos are almost never this large
const TIMEOUT    = 12000;

// Load env
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

function stemFromFile(filename) {
  return filename.replace(/\.[^.]+$/, '');
}

function domainFromStem(stem) {
  // Convert stem back to rough domain for Google API (best effort)
  return stem.replace(/_/g, '.');
}

function downloadFile(url, dest, redirects = 0) {
  return new Promise(resolve => {
    if (redirects > 5) return resolve(false);
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124', Accept: 'image/*' }
      }, res => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          res.resume();
          return downloadFile(res.headers.location, dest, redirects + 1).then(resolve);
        }
        if (res.statusCode !== 200) { res.resume(); return resolve(false); }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(() => {
          try {
            const size = fs.statSync(dest).size;
            if (size >= MIN_BYTES && size <= MAX_BYTES) resolve(true);
            else { fs.unlinkSync(dest); resolve(false); }
          } catch { resolve(false); }
        }));
        file.on('error', () => { try { fs.unlinkSync(dest); } catch {} resolve(false); });
      });
      req.on('error', () => resolve(false));
      req.setTimeout(TIMEOUT, () => { req.destroy(); resolve(false); });
    } catch { resolve(false); }
  });
}

const rGet = async (key) => (await (await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${REDIS_TOKEN}` } })).json()).result;
const rSet = async (key, val) => (await fetch(`${REDIS_URL}/set/${encodeURIComponent(key)}`, { method: 'POST', headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(val) })).ok;

console.log('\nScanning logos directory for bad files...\n');

const files = fs.readdirSync(LOGO_DIR);
const badFiles = [];

for (const f of files) {
  const abs  = path.join(LOGO_DIR, f);
  const size = fs.statSync(abs).size;
  if (size > MAX_BYTES) {
    console.log(`  🔴 TOO LARGE  (${(size/1024/1024).toFixed(1)}MB): ${f}`);
    badFiles.push({ file: f, abs, reason: 'too-large' });
  } else if (size < MIN_BYTES) {
    console.log(`  🟡 TOO SMALL  (${size}B): ${f}`);
    badFiles.push({ file: f, abs, reason: 'too-small' });
  }
}

if (badFiles.length === 0) {
  console.log('  ✅ All files look good — no bad logos found.\n');
  process.exit(0);
}

console.log(`\nFound ${badFiles.length} bad file(s). Deleting and re-fetching via Google Favicons...\n`);

const raw  = await rGet(REDIS_KEY);
const db   = typeof raw === 'string' ? JSON.parse(raw) : raw;
let dbChanged = false;

for (const { file, abs } of badFiles) {
  const stem   = stemFromFile(file);
  const domain = domainFromStem(stem);
  const dest   = path.join(LOGO_DIR, file);

  // Delete bad file
  try { fs.unlinkSync(abs); } catch {}

  // Re-fetch from Google Favicons (reliable, size-capped at ~5KB)
  const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
  process.stdout.write(`  ⏳ ${stem.padEnd(30)} re-fetching...`);
  const ok = await downloadFile(googleUrl, dest);

  if (ok) {
    const newSize = fs.statSync(dest).size;
    process.stdout.write(` ✅ (${newSize}B)\n`);
    // Update DB to point to this path
    const pubPath = `/logos/${file}`;
    for (const site of db.sites) {
      if (site.faviconUrl === pubPath || (site.faviconUrl && site.faviconUrl.includes(stem))) {
        // already correct
      }
    }
  } else {
    process.stdout.write(` ❌ failed — site will use initials placeholder\n`);
    // Clear bad faviconUrl from DB so SiteIcon falls through to Google at runtime
    for (const site of db.sites) {
      const pubPath = `/logos/${file}`;
      if (site.faviconUrl === pubPath) {
        site.faviconUrl = googleUrl;
        dbChanged = true;
      }
    }
  }
}

if (dbChanged) {
  console.log('\nUpdating Redis DB...');
  const ok = await rSet(REDIS_KEY, db);
  console.log(ok ? '✅ DB updated.\n' : '❌ Redis write failed.\n');
}

console.log('Done!\n');
