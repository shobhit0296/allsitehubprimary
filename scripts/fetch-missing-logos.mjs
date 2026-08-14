/**
 * scripts/fetch-missing-logos.mjs
 * Run once to fetch logos for all sites that still have external favicon URLs.
 * Usage: node scripts/fetch-missing-logos.mjs
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Patch process.cwd() to return project root
const origCwd = process.cwd.bind(process);
process.cwd = () => projectRoot;

const require = createRequire(import.meta.url);

// Load the compiled logo-fetcher via ts-node equivalent using require with tsx
// Since we can't easily run TS directly, let's inline the logic using the compiled .next output
// Instead, let's directly use the Node.js http/https modules

import https from 'https';
import http from 'http';
import fs from 'fs';

const LOGO_DIR = path.join(projectRoot, 'public', 'logos');
const MIN_LOGO_BYTES = 200;
const TIMEOUT_MS = 10000;

if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true });

function normalizeDomain(input) {
  let s = input.trim();
  if (!s.startsWith('http://') && !s.startsWith('https://')) s = `https://${s}`;
  try { return new URL(s).hostname.replace(/^www\./, ''); } 
  catch { return input.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase(); }
}

function domainToFileStem(domain) {
  return domain.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function getCachedLogoPath(domain) {
  const stem = domainToFileStem(normalizeDomain(domain));
  for (const ext of ['png', 'svg', 'ico', 'webp']) {
    const abs = path.join(LOGO_DIR, `${stem}.${ext}`);
    if (fs.existsSync(abs) && fs.statSync(abs).size >= MIN_LOGO_BYTES) return `/logos/${stem}.${ext}`;
  }
  return null;
}

function downloadFile(url, dest, redirects = 0) {
  return new Promise(resolve => {
    if (redirects > 5) return resolve(false);
    const client = url.startsWith('https') ? https : http;
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
          if (fs.existsSync(dest) && fs.statSync(dest).size >= MIN_LOGO_BYTES) resolve(true);
          else { fs.unlink(dest, () => {}); resolve(false); }
        } catch { resolve(false); }
      }));
      file.on('error', () => { fs.unlink(dest, () => {}); resolve(false); });
    });
    req.on('error', () => { try { fs.unlink(dest, () => {}); } catch {} resolve(false); });
    req.setTimeout(TIMEOUT_MS, () => { req.destroy(); try { fs.unlink(dest, () => {}); } catch {} resolve(false); });
  });
}

function fetchHTML(url, redirects = 0) {
  return new Promise(resolve => {
    if (redirects > 5) return resolve(null);
    const client = url.startsWith('https') ? https : http;
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
      res.on('data', chunk => { data += chunk; if (data.length > 200_000) { req.destroy(); resolve(data); } });
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(null));
    req.setTimeout(TIMEOUT_MS, () => { req.destroy(); resolve(null); });
  });
}

function extractLogoUrls(html, baseUrl) {
  const candidates = [];
  const add = (url, score) => { if (url) candidates.push({ url, score }); };

  for (const m of html.matchAll(/<link[^>]+rel=["'](?:apple-touch-icon|apple-touch-icon-precomposed)["'][^>]+href=["']([^"']+)["']/gi)) add(m[1], 100);
  for (const m of html.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:apple-touch-icon|apple-touch-icon-precomposed)["']/gi)) add(m[1], 100);
  for (const m of html.matchAll(/<link[^>]+rel=["'](?:shortcut icon|icon)["'][^>]+sizes=["'](\d+)x\d+["'][^>]+href=["']([^"']+)["']/gi)) {
    const px = parseInt(m[1] ?? '0', 10);
    add(m[2], 50 + Math.min(px, 512));
  }
  for (const m of html.matchAll(/<link[^>]+rel=["'](?:shortcut icon|icon|mask-icon)["'][^>]+href=["']([^"']+)["']/gi)) add(m[1], 30);
  for (const m of html.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut icon|icon|mask-icon)["']/gi)) add(m[1], 30);
  for (const m of html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi)) add(m[1], 15);

  candidates.sort((a, b) => b.score - a.score);
  const resolved = candidates.map(c => { try { return new URL(c.url, baseUrl).toString(); } catch { return null; } }).filter(Boolean);
  try {
    const origin = new URL(baseUrl).origin;
    resolved.push(`${origin}/apple-touch-icon.png`, `${origin}/favicon.ico`, `${origin}/favicon.png`, `${origin}/favicon-32x32.png`);
  } catch {}
  return [...new Set(resolved)];
}

async function fetchLogo(domain) {
  const clean = normalizeDomain(domain);
  const stem = domainToFileStem(clean);
  const originUrl = `https://${clean}`;

  const html = await fetchHTML(originUrl);
  if (html) {
    const candidates = extractLogoUrls(html, originUrl);
    for (const candUrl of candidates) {
      const ext = candUrl.toLowerCase().includes('.svg') ? 'svg' : 'png';
      const dest = path.join(LOGO_DIR, `${stem}.${ext}`);
      if (await downloadFile(candUrl, dest)) return `/logos/${stem}.${ext}`;
    }
  }

  const destPng = path.join(LOGO_DIR, `${stem}.png`);
  for (const url of [`${originUrl}/apple-touch-icon.png`, `${originUrl}/favicon.ico`, `${originUrl}/favicon.png`]) {
    if (await downloadFile(url, destPng)) return `/logos/${stem}.png`;
  }

  const googleUrl = `https://www.google.com/s2/favicons?domain=${clean}&sz=256`;
  if (await downloadFile(googleUrl, destPng)) return `/logos/${stem}.png`;

  return null;
}

// Sites to fetch — all Movies & Shows + any others missing local logos
const SITES = [
  // Movies & Shows
  { name: 'Netflix', domain: 'netflix.com' },
  { name: 'Prime Video', domain: 'primevideo.com' },
  { name: 'Disney+', domain: 'disneyplus.com' },
  { name: 'Max', domain: 'max.com' },
  { name: 'Apple TV+', domain: 'tv.apple.com' },
  { name: 'Hulu', domain: 'hulu.com' },
  { name: 'Peacock', domain: 'peacocktv.com' },
  { name: 'Paramount+', domain: 'paramountplus.com' },
  { name: 'Tubi', domain: 'tubitv.com' },
  { name: 'Hotstar', domain: 'hotstar.com' },
  { name: 'Pluto TV', domain: 'pluto.tv' },
  { name: 'Mubi', domain: 'mubi.com' },
  { name: 'world4ufree', domain: 'world4ufree.im' },
  // Anime
  { name: 'Crunchyroll', domain: 'crunchyroll.com' },
  { name: 'HiDive', domain: 'hidive.com' },
  { name: 'Aniwatch', domain: 'aniwatch.to' },
  { name: 'AnimePahe', domain: 'animepahe.ru' },
  { name: 'Bilibili', domain: 'bilibili.com' },
  { name: 'AnimeDao', domain: 'animedao.to' },
  // Manga
  { name: 'MangaDex', domain: 'mangadex.org' },
  { name: 'Manga Plus', domain: 'mangaplus.shueisha.co.jp' },
  { name: 'Webtoon', domain: 'webtoons.com' },
  { name: 'MangaFire', domain: 'mangafire.to' },
  { name: 'MangaSee', domain: 'mangasee123.com' },
  // Live TV & Sports
  { name: 'ESPN+', domain: 'espnplus.com' },
  { name: 'DAZN', domain: 'dazn.com' },
  { name: 'fuboTV', domain: 'fubo.tv' },
  { name: 'BBC iPlayer', domain: 'bbc.co.uk' },
  { name: 'SonyLIV', domain: 'sonyliv.com' },
  { name: 'Sling TV', domain: 'sling.com' },
  // Paid
  { name: 'Starz', domain: 'starz.com' },
  { name: 'Shudder', domain: 'shudder.com' },
  { name: 'BritBox', domain: 'britbox.com' },
  // Apps
  { name: 'Plex', domain: 'plex.tv' },
  { name: 'Kodi', domain: 'kodi.tv' },
  { name: 'VLC', domain: 'videolan.org' },
  { name: 'Infuse', domain: 'firecore.com' },
];

console.log(`\nFetching logos for ${SITES.length} sites...\n`);

let updated = 0;
let skipped = 0;
let failed = 0;

for (const site of SITES) {
  const cached = getCachedLogoPath(site.domain);
  if (cached) {
    console.log(`  ⏭  ${site.name.padEnd(18)} already cached: ${cached}`);
    skipped++;
    continue;
  }
  process.stdout.write(`  ⏳ ${site.name.padEnd(18)} fetching...`);
  const result = await fetchLogo(site.domain);
  if (result) {
    console.log(` ✅ ${result}`);
    updated++;
  } else {
    console.log(` ❌ failed`);
    failed++;
  }
}

console.log(`\nDone! ✅ ${updated} fetched  ⏭  ${skipped} skipped  ❌ ${failed} failed\n`);
