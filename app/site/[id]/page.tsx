import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { readDB } from '@/lib/db';
import { siteConfig, slugify, shouldIndexWebsitePage } from '@/lib/siteConfig';
import PageHeader from '../../components/PageHeader';
import PageFooter from '../../components/PageFooter';
import SiteCard from '../../components/SiteCard';
import SiteIcon from '../../components/SiteIcon';
import Breadcrumbs from '../../components/Breadcrumbs';
import JsonLd from '../../components/JsonLd';
import VpnCallout from '../../components/VpnCallout';

interface Props {
  params: Promise<{ id: string }>;
}

function getSiteOverview(site: { name: string; domain: string; category: string; description?: string; isTrusted?: boolean; regions?: string[] }): string {
  if (site.description && site.description.trim().length >= 20) {
    return site.description;
  }
  const categoryTerms: Record<string, string> = {
    'Movies & Shows': 'movie and TV series streaming platform',
    'Anime': 'anime streaming and discovery resource',
    'Manga': 'online manga and comics reader platform',
    'Live TV & Sports': 'live television and sports streaming portal',
    'Paid': 'premium subscription streaming service',
    'Apps': 'media player and streaming application',
  };
  const typeDesc = categoryTerms[site.category] || 'curated online resource';
  const trustDesc = site.isTrusted ? ' It has been verified under the AllSiteHub Quality Standard for uptime and security protocols.' : '';
  const regionDesc = site.regions && site.regions.length > 0 ? ` Accessible across ${site.regions.join(', ')}.` : '';
  return `${site.name} (${site.domain}) is a curated ${typeDesc} listed in the ${site.category} section on AllSiteHub.${trustDesc}${regionDesc}`;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateStaticParams() {
  const db = await readDB();
  return db.sites.map(s => ({
    id: slugify(s.name),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const db = await readDB();
  const site = db.sites.find(s => slugify(s.name) === id);
  if (!site) return { title: 'Site Not Found' };

  const isIndexable = shouldIndexWebsitePage(site);
  const title = `${site.name} — Details, Features & Alternatives`;
  const description = getSiteOverview(site);
  const canonicalUrl = `${siteConfig.url}/site/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: isIndexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export default async function SiteDetailPage({ params }: Props) {
  const { id } = await params;
  const db = await readDB();
  const site = db.sites.find(s => slugify(s.name) === id);
  if (!site) notFound();

  const relatedSites = db.sites
    .filter(s => s.category === site.category && s.id !== site.id)
    .slice(0, 6);

  const catSlug = slugify(site.category);

  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${site.name} — AllSiteHub Directory`,
    url: `${siteConfig.url}/site/${id}`,
    description: site.description || `${site.name} in ${site.category}`,
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntity: {
      '@type': 'WebSite',
      name: site.name,
      url: site.url,
      description: site.description || undefined,
    },
  };

  return (
    <div className="min-h-screen flex flex-col relative page-offset">
      <div className="noise-overlay" />
      <PageHeader active={site.category} />
      <Breadcrumbs
        items={[
          { label: 'Categories', href: '/#categories' },
          { label: site.category, href: `/category/${catSlug}` },
          { label: site.name },
        ]}
      />

      <JsonLd schema={webPageLd} />
      <section className="relative overflow-hidden px-4 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[70%] h-[70%] bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-grid-lux opacity-20" />
        </div>

        <div className="relative z-10 max-w-[960px] mx-auto w-full">

          {/* Main Detail Header Card */}
          <div className="glass-lux border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-white/[0.08]">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                  <SiteIcon
                    name={site.name}
                    domain={site.domain}
                    faviconUrl={site.faviconUrl}
                    size={48}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <h1 className="font-headline text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
                      {site.name}
                    </h1>
                    {site.isTrusted && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        ✓ Trusted
                      </span>
                    )}
                    {site.isNew && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400">
                        ✦ New
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] flex items-center gap-2">
                    <span>🌐 {site.domain}</span>
                    <span>·</span>
                    <span>Category: <strong className="text-blue-400 font-semibold">{site.category}</strong></span>
                  </p>
                </div>
              </div>

              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brand px-8 py-3.5 rounded-2xl text-sm font-bold shadow-xl flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <span>Visit {site.name}</span>
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </a>
            </div>

            {/* Description */}
            <div className="py-7 border-b border-white/[0.08]">
              <h2 className="font-headline text-base font-bold text-[var(--text-primary)] mb-3">About {site.name}</h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {getSiteOverview(site)}
              </p>
            </div>

            {/* VPN Callout — shown between description and regions for max intent */}
            <div className="py-5 border-b border-white/[0.08]">
              <VpnCallout />
            </div>

            {/* Target Regions */}
            <div className="pt-6 flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Supported Regions:</span>
              {site.regions.map(r => (
                <span key={r} className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[var(--text-secondary)]">
                  🌍 {r}
                </span>
              ))}
            </div>
          </div>

          {/* Related Sites */}
          {relatedSites.length > 0 && (
            <div className="mt-16">

              <h3 className="font-headline text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <span>✦</span>
                <span>Similar {site.category} Sites & Alternatives</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedSites.map(rel => (
                  <div key={rel.id} className="flex flex-col gap-2">
                    <SiteCard site={rel} />
                    <Link
                      href={`/site/${slugify(rel.name)}`}
                      className="text-[11.5px] font-semibold text-blue-400 hover:text-blue-300 transition-colors self-end px-2"
                    >
                      View details →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
