import type { MetadataRoute } from 'next';
import { readDB } from '@/lib/db';
import { CATEGORIES } from '@/lib/data';
import { COLLECTIONS } from './collections/page';

const BASE_URL = 'https://allsitehub.site';

function slugify(name: string): string {
  return name.replace(/\s+/g, '-').replace(/&/g, 'and').toLowerCase();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const db = await readDB();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/collections`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/how-we-review-websites`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/request`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/dmca`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Category Landing Pages
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map(c => ({
    url: `${BASE_URL}/category/${slugify(c.name)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Editorial Collection Pages
  const collectionPages: MetadataRoute.Sitemap = COLLECTIONS.map(c => ({
    url: `${BASE_URL}/collections/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Website Detail Pages
  const sitePages: MetadataRoute.Sitemap = db.sites.map(s => ({
    url: `${BASE_URL}/site/${slugify(s.name)}`,
    lastModified: s.addedAt ? new Date(s.addedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...collectionPages, ...sitePages];
}
