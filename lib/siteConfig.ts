/**
 * lib/siteConfig.ts — Centralized Canonical Identity and SEO Configuration
 */
import type { Site } from './data';

export const siteConfig = {
  name: 'AllSiteHub',
  title: 'AllSiteHub — Discover the Best Websites, Tools & Online Resources',
  tagline: 'Discover the Best Websites, Tools & Online Resources',
  description:
    'Discover useful websites, online tools, entertainment platforms and resources with AllSiteHub. Search and explore curated websites by category, region and purpose.',
  url: 'https://www.allsitehub.site',
  canonicalUrl: 'https://www.allsitehub.site',
  ogImage: 'https://www.allsitehub.site/icon.png',
  founder: {
    name: 'Shobhit Verma',
    role: 'Founder & Lead Curator',
  },
  contact: {
    email: 'allsitehubsupport@gmail.com',
  },
  social: {
    discord: 'https://discord.gg/ZEMSvP2HX',
    telegram: 'https://t.me/+gWOCVAqtcXxkZDk9',
    reddit: 'https://www.reddit.com/user/allsitehub/',
  },
} as const;

/**
 * Generates URL-friendly, deterministic slugs
 */
export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalizes domain strings to canonical form for deduplication
 */
export function normalizeDomain(domainOrUrl: string): string {
  if (!domainOrUrl) return '';
  return domainOrUrl
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .replace(/[?#].*$/, '');
}

/**
 * SEO Quality Gate Threshold (Section 9 Compliance)
 * Only sites with sufficient unique content are flagged as indexable in search engines and sitemaps.
 */
export function shouldIndexWebsitePage(site: Partial<Site>): boolean {
  if (!site.name || !site.url || !site.category) {
    return false;
  }

  // Must have a non-empty description, tags, multiple regions, or custom metadata
  const hasDescription = Boolean(site.description && site.description.trim().length >= 10);
  const hasTags = Boolean(site.tags && site.tags.length > 0);
  const hasRegions = Boolean(site.regions && site.regions.length > 0);

  return hasDescription || hasTags || hasRegions;
}
