import type { MetadataRoute } from 'next';
import { readDB } from '@/lib/db';
import { CATEGORIES } from '@/lib/data';
import { siteConfig, slugify, shouldIndexWebsitePage } from '@/lib/siteConfig';
import { COLLECTIONS } from '@/lib/collections';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const db = await readDB();

  // Static core pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteConfig.url}/collections`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteConfig.url}/how-we-review-websites`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteConfig.url}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteConfig.url}/request`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteConfig.url}/dmca`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Category Landing Pages
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map(c => ({
    url: `${siteConfig.url}/category/${slugify(c.name)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Editorial Collection Pages
  const collectionPages: MetadataRoute.Sitemap = COLLECTIONS.map(c => ({
    url: `${siteConfig.url}/collections/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Website Detail Pages — filtered strictly by SEO quality threshold (Section 9 & 20)
  const indexableSites = db.sites.filter(s => shouldIndexWebsitePage(s));
  const sitePages: MetadataRoute.Sitemap = indexableSites.map(s => ({
    url: `${siteConfig.url}/site/${slugify(s.name)}`,
    lastModified: s.addedAt ? new Date(s.addedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...collectionPages, ...sitePages];
}
