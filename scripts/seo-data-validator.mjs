#!/usr/bin/env node
/**
 * scripts/seo-data-validator.mjs
 * Validates database entries for SEO integrity, domain normalization, and duplicates.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const dbPath = path.join(rootDir, 'data', 'db.json');

function normalizeDomain(urlStr) {
  if (!urlStr) return '';
  return urlStr
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .replace(/[?#].*$/, '');
}

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

console.log('🔍 Running AllSiteHub Data & Duplicate SEO Audit...\n');

if (!fs.existsSync(dbPath)) {
  console.error(`❌ db.json not found at ${dbPath}`);
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const sites = rawData.sites || [];
const categories = rawData.categories || [];

console.log(`📦 Loaded ${sites.length} sites across ${categories.length} categories.`);

const issues = {
  missingNames: [],
  invalidUrls: [],
  duplicateDomains: new Map(),
  duplicateSlugs: new Map(),
  missingCategories: [],
  shortDescriptions: [],
};

const domainMap = new Map();
const slugMap = new Map();

for (const site of sites) {
  // Name check
  if (!site.name || !site.name.trim()) {
    issues.missingNames.push(site.id || 'unknown_id');
  }

  // URL check
  if (!site.url || !site.url.startsWith('http')) {
    issues.invalidUrls.push({ id: site.id, name: site.name, url: site.url });
  }

  // Domain Normalization & Duplicate check
  const normDomain = normalizeDomain(site.domain || site.url);
  if (normDomain) {
    if (domainMap.has(normDomain)) {
      const existing = domainMap.get(normDomain);
      if (!issues.duplicateDomains.has(normDomain)) {
        issues.duplicateDomains.set(normDomain, [existing]);
      }
      issues.duplicateDomains.get(normDomain).push({ id: site.id, name: site.name, url: site.url });
    } else {
      domainMap.set(normDomain, { id: site.id, name: site.name, url: site.url });
    }
  }

  // Slug check
  const slug = slugify(site.name || '');
  if (slug) {
    if (slugMap.has(slug)) {
      const existing = slugMap.get(slug);
      if (!issues.duplicateSlugs.has(slug)) {
        issues.duplicateSlugs.set(slug, [existing]);
      }
      issues.duplicateSlugs.get(slug).push({ id: site.id, name: site.name });
    } else {
      slugMap.set(slug, { id: site.id, name: site.name });
    }
  }

  // Category check
  if (!site.category || !site.category.trim()) {
    issues.missingCategories.push({ id: site.id, name: site.name });
  }

  // Description quality check
  if (!site.description || site.description.trim().length < 15) {
    issues.shortDescriptions.push({ id: site.id, name: site.name, descLength: site.description ? site.description.length : 0 });
  }
}

// Summary Report
console.log('\n📊 === SEO DATA AUDIT REPORT ===');
console.log(`- Total Sites: ${sites.length}`);
console.log(`- Unique Domains: ${domainMap.size}`);
console.log(`- Duplicate Domains: ${issues.duplicateDomains.size}`);
console.log(`- Duplicate Slugs: ${issues.duplicateSlugs.size}`);
console.log(`- Invalid URLs: ${issues.invalidUrls.length}`);
console.log(`- Sites with Short/Empty Descriptions: ${issues.shortDescriptions.length}`);

if (issues.duplicateDomains.size > 0) {
  console.log('\n⚠️ Duplicate Domains Found:');
  for (const [domain, list] of issues.duplicateDomains.entries()) {
    console.log(`  - Domain: ${domain}`);
    for (const item of list) {
      console.log(`     ↳ ID: ${item.id} | Name: ${item.name} | URL: ${item.url}`);
    }
  }
}

// Generate docs/DUPLICATE_DATA_REPORT.md
const docsDir = path.join(rootDir, 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

let markdownReport = `# AllSiteHub Duplicate & Data Validation Report\n\n`;
markdownReport += `Generated: ${new Date().toISOString()}\n\n`;
markdownReport += `## Summary\n`;
markdownReport += `- **Total Listings Audited**: ${sites.length}\n`;
markdownReport += `- **Unique Canonical Domains**: ${domainMap.size}\n`;
markdownReport += `- **Duplicate Domains**: ${issues.duplicateDomains.size}\n`;
markdownReport += `- **Duplicate Slugs**: ${issues.duplicateSlugs.size}\n`;
markdownReport += `- **Invalid / Missing URLs**: ${issues.invalidUrls.length}\n\n`;

if (issues.duplicateDomains.size > 0) {
  markdownReport += `## Duplicate Domain Listings\n\n`;
  for (const [domain, list] of issues.duplicateDomains.entries()) {
    markdownReport += `### Domain: \`${domain}\`\n`;
    for (const item of list) {
      markdownReport += `- **${item.name}** (ID: \`${item.id}\`) — [${item.url}](${item.url})\n`;
    }
    markdownReport += `\n`;
  }
} else {
  markdownReport += `## Duplicate Domains\nNo duplicate domains detected.\n\n`;
}

if (issues.shortDescriptions.length > 0) {
  markdownReport += `## Quality Threshold Gating Status\n`;
  markdownReport += `${issues.shortDescriptions.length} sites have sparse descriptions (<15 chars) and will receive \`noindex, follow\` tag until enriched.\n`;
}

fs.writeFileSync(path.join(docsDir, 'DUPLICATE_DATA_REPORT.md'), markdownReport, 'utf8');
console.log(`\n📄 Report written to docs/DUPLICATE_DATA_REPORT.md`);

if (issues.missingNames.length > 0 || issues.invalidUrls.length > 0) {
  console.error('\n❌ Critical data validation failures detected.');
  process.exit(1);
} else {
  console.log('\n✅ Data integrity validation passed.');
}
