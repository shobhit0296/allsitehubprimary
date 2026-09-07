#!/usr/bin/env node
/**
 * scripts/seo-audit.mjs
 * Runs comprehensive on-page and technical SEO checks on codebase source files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('⚡ Running Automated SEO Source & Architecture Audit...\n');

const checks = [
  {
    name: 'Centralized Site Configuration',
    file: 'lib/siteConfig.ts',
    test: (content) => content.includes('allsitehub.site') && content.includes('slugify') && content.includes('shouldIndexWebsitePage'),
  },
  {
    name: 'Layout Metadata & Canonical base',
    file: 'app/layout.tsx',
    test: (content) => content.includes('metadataBase') && content.includes('siteConfig.url') && content.includes('jsonLdWebsite'),
  },
  {
    name: 'Category Page Metadata & BreadcrumbList',
    file: 'app/category/[slug]/page.tsx',
    test: (content) => content.includes('generateMetadata') && content.includes('Breadcrumbs') && content.includes('CollectionPage'),
  },
  {
    name: 'Site Profile Gating & Canonical URLs',
    file: 'app/site/[id]/page.tsx',
    test: (content) => content.includes('shouldIndexWebsitePage') && content.includes('Breadcrumbs') && content.includes('rel="noopener noreferrer"'),
  },
  {
    name: 'Dynamic Sitemap Architecture',
    file: 'app/sitemap.ts',
    test: (content) => content.includes('shouldIndexWebsitePage') && content.includes('siteConfig.url'),
  },
  {
    name: 'Robots.txt Crawl Directives',
    file: 'app/robots.ts',
    test: (content) => content.includes('sitemap.xml') && content.includes('userAgent'),
  },
  {
    name: 'Privacy Policy (AdSense & Legal Compliance)',
    file: 'app/privacy/page.tsx',
    test: (content) => content.includes('Privacy Policy') && content.includes('AdSense') && content.includes('siteConfig.url'),
  },
  {
    name: 'Terms of Service (Legal Protection & Trust)',
    file: 'app/terms/page.tsx',
    test: (content) => content.includes('Terms of Service') && content.includes('siteConfig.url'),
  },
  {
    name: 'Recently Added Directory Page',
    file: 'app/recent/page.tsx',
    test: (content) => content.includes('Recently Added') && content.includes('addedAt'),
  },
];

let allPassed = true;

for (const check of checks) {
  const filePath = path.join(rootDir, check.file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ [FAIL] Missing file: ${check.file}`);
    allPassed = false;
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (check.test(content)) {
    console.log(`✅ [PASS] ${check.name} (${check.file})`);
  } else {
    console.log(`❌ [FAIL] Verification rule failed in ${check.file}`);
    allPassed = false;
  }
}

if (!allPassed) {
  console.error('\n❌ SEO Architecture Audit found issues.');
  process.exit(1);
} else {
  console.log('\n🎉 All SEO Architecture & Quality Checks Passed successfully!');
}
