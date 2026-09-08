import type { Metadata } from 'next';
import Link from 'next/link';
import { readDB } from '@/lib/db';
import { siteConfig, slugify } from '@/lib/siteConfig';
import PageHeader from '../components/PageHeader';
import PageFooter from '../components/PageFooter';
import SiteCard from '../components/SiteCard';
import Breadcrumbs from '../components/Breadcrumbs';
import JsonLd from '../components/JsonLd';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Recently Added Websites & Tools',
  description:
    'Discover the newest websites, streaming platforms, AI tools, and online resources recently verified and added to AllSiteHub.',
  alternates: {
    canonical: `${siteConfig.url}/recent`,
  },
  openGraph: {
    title: 'Recently Added Websites & Tools — AllSiteHub',
    description: 'Explore the newest verified websites added to the AllSiteHub directory.',
    url: `${siteConfig.url}/recent`,
    type: 'website',
  },
};

export default async function RecentSitesPage() {
  const db = await readDB();
  
  // Sort by addedAt timestamp descending
  const recentSites = [...db.sites]
    .filter(s => s.addedAt)
    .sort((a, b) => b.addedAt - a.addedAt)
    .slice(0, 48);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Recently Added',
        item: `${siteConfig.url}/recent`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col relative page-offset">
      <div className="noise-overlay" />
      <PageHeader active="Recent" />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Recently Added' },
        ]}
      />
      <JsonLd schema={breadcrumbLd} />

      <main className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 py-10 sm:py-14 w-full flex-1">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 mb-3 tracking-wide uppercase">
            Fresh Directory Additions
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3">
            Recently Added Websites
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Discover the latest verified streaming platforms, tools, and web resources added to our directory, ordered by actual listing date.
          </p>
        </div>

        <div className="sites-grid">
          {recentSites.map(site => {
            const dateStr = new Date(site.addedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={site.id} className="flex flex-col gap-1.5 group">
                <SiteCard site={site} />
                <div className="flex items-center justify-between px-1 text-[11px] text-[var(--text-muted)]">
                  <span>{dateStr}</span>
                  <Link
                    href={`/site/${slugify(site.name)}`}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
