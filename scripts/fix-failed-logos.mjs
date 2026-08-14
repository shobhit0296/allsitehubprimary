/**
 * scripts/fix-failed-logos.mjs
 * Targeted fix for the 3 sites that failed: HULU, ONDEMAND, PvrPlay
 * Uses Google Favicons API as guaranteed fallback and updates Redis DB.
 */

import path from 'path';
import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const LOGO_DIR  = path.join(projectRoot, 'public', 'logos');
const MIN_BYTES = 200;
const TIMEOUT   = 12000;

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

function stem(domain) {
  return domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    .replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function downloadFile(url, dest, redirects = 0) {
  return new Promise(resolve => {
    if (redirects > 5) return resolve(false);
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 Chrome/124.0.0.0 Safari/537.36',
        Accept: 'image/*,*/*;q=0.8',
      }
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
          resolve(fs.existsSync(dest) && fs.statSync(dest).size >= MIN_BYTES);
        } catch { resolve(false); }
        if (!resolve) { try { fs.unlinkSync(dest); } catch {} }
      }));
      file.on('error', () => { try { fs.unlinkSync(dest); } catch {} resolve(false); });
    });
    req.on('error', () => resolve(false));
    req.setTimeout(TIMEOUT, () => { req.destroy(); resolve(false); });
  });
}

// Redis helpers
const rGet = async (key) => {
  const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  return (await res.json()).result;
};
const rSet = async (key, value) => {
  const res = await fetch(`${REDIS_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
  return res.ok;
};

// Sites to fix — name pattern match + domain + fallback strategies
const TO_FIX = [
  // HULU — hulu.com blocks scrapers; Google API always works
  { nameMatch: 'HULU', domain: 'hulu.com', urls: [
    'https://www.google.com/s2/favicons?domain=hulu.com&sz=256',
    'https://icon.horse/icon/hulu.com',
    'https://icons.duckduckgo.com/ip3/hulu.com.ico',
  ]},
  // ONDEMAND — try multiple possible domains
  { nameMatch: 'ONDEMAND', domain: 'ondemand.com', urls: [
    'https://www.google.com/s2/favicons?domain=ondemand.com&sz=256',
    'https://icon.horse/icon/ondemand.com',
  ]},
  // PvrPlay — domain is pvrplay.online in DB; direct icon URL known
  { nameMatch: 'PvrPlay', domain: 'pvrplay.online', urls: [
    'https://pvrplay.online/pvrplay-icon.png',
    'https://www.google.com/s2/favicons?domain=pvrplay.online&sz=256',
    'https://icon.horse/icon/pvrplay.online',
    'https://icons.duckduckgo.com/ip3/pvrplay.online.ico',
  ]},
];

console.log('\nFixing 3 failed logo sites...\n');

const raw = await rGet(REDIS_KEY);
const db  = typeof raw === 'string' ? JSON.parse(raw) : raw;
let dbUpdated = 0;

for (const fix of TO_FIX) {
  const fileStem = stem(fix.domain);
  const dest     = path.join(LOGO_DIR, `${fileStem}.png`);
  const pubPath  = `/logos/${fileStem}.png`;

  // Check if already on disk from a previous attempt
  if (fs.existsSync(dest) && fs.statSync(dest).size >= MIN_BYTES) {
    console.log(`  ✅ ${fix.nameMatch.padEnd(12)} already on disk: ${pubPath}`);
    // Still update DB record
    const site = db.sites.find(s => s.name?.toUpperCase() === fix.nameMatch.toUpperCase());
    if (site && site.faviconUrl !== pubPath) { site.faviconUrl = pubPath; dbUpdated++; }
    continue;
  }

  process.stdout.write(`  ⏳ ${fix.nameMatch.padEnd(12)} trying ${fix.urls.length} sources...`);
  let ok = false;
  for (const url of fix.urls) {
    ok = await downloadFile(url, dest);
    if (ok) break;
  }

  if (ok) {
    process.stdout.write(` ✅ saved → ${pubPath}\n`);
    const site = db.sites.find(s => s.name?.toUpperCase() === fix.nameMatch.toUpperCase());
    if (site) { site.faviconUrl = pubPath; dbUpdated++; }
  } else {
    process.stdout.write(` ❌ all sources failed — will show initials placeholder\n`);
  }
}

if (dbUpdated > 0) {
  console.log(`\nSaving ${dbUpdated} record(s) to Redis...`);
  const ok = await rSet(REDIS_KEY, db);
  console.log(ok ? `✅ Done!\n` : `❌ Redis write failed\n`);
} else {
  console.log('\nNothing to update in DB.\n');
}
