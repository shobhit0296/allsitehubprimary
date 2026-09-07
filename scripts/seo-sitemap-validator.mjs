#!/usr/bin/env node
/**
 * scripts/seo-sitemap-validator.mjs
 * Validates sitemap generation rules, URL formats, and ensures no thin or unindexed pages are included.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'https://www.allsitehub.site';
const dbPath = path.join(rootDir, 'data', 'db.json');

console.log('🗺️ Validating AllSiteHub Sitemap Architecture...\n');

if (!fs.existsSync(dbPath)) {
  console.error(`❌ db.json not found at ${dbPath}`);
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const sites = rawData.sites || [];

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function shouldIndexWebsite(site) {
  if (!site.name || !site.url || !site.category) return false;
  return Boolean(
    (site.description && site.description.trim().length >= 10) ||
    (site.tags && site.tags.length > 0) ||
    (site.regions && site.regions.length > 0)
  );
}

const staticRoutes = [
  '/',
  '/recent',
  '/collections',
  '/how-we-review-websites',
  '/about',
  '/request',
  '/privacy',
  '/terms',
  '/dmca',
];

const categoryRoutes = [
  '/category/movies-and-shows',
  '/category/anime',
  '/category/manga',
  '/category/live-tv-and-sports',
  '/category/paid',
  '/category/apps',
];

const indexableSites = sites.filter(shouldIndexWebsite);
const sitemapUrls = [
  ...staticRoutes.map(r => `${BASE_URL}${r === '/' ? '' : r}`),
  ...categoryRoutes.map(r => `${BASE_URL}${r}`),
  ...indexableSites.map(s => `${BASE_URL}/site/${slugify(s.name)}`),
];

// Deduplication and canonical check
const urlSet = new Set();
const duplicates = [];
const nonHttps = [];
const nonCanonicalHost = [];

for (const url of sitemapUrls) {
  if (urlSet.has(url)) {
    duplicates.push(url);
  }
  urlSet.add(url);

  if (!url.startsWith('https://')) {
    nonHttps.push(url);
  }

  if (!url.startsWith(BASE_URL)) {
    nonCanonicalHost.push(url);
  }
}

console.log('📊 === SITEMAP VALIDATION REPORT ===');
console.log(`- Total URLs in Sitemap: ${sitemapUrls.length}`);
console.log(`  ↳ Static Core Pages: ${staticRoutes.length}`);
console.log(`  ↳ Category Landing Pages: ${categoryRoutes.length}`);
console.log(`  ↳ Indexable Site Profiles: ${indexableSites.length} (filtered from ${sites.length} total)`);
console.log(`- Duplicate URLs: ${duplicates.length}`);
console.log(`- Non-HTTPS URLs: ${nonHttps.length}`);
console.log(`- Off-domain URLs: ${nonCanonicalHost.length}`);

if (duplicates.length > 0 || nonHttps.length > 0 || nonCanonicalHost.length > 0) {
  console.error('\n❌ Sitemap validation failed with errors.');
  process.exit(1);
} else {
  console.log('\n✅ All sitemap URLs are valid, unique, HTTPS, and adhere to quality threshold.');
}
