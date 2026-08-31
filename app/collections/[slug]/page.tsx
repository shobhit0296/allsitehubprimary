import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { readDB } from '@/lib/db';
import PageHeader from '../../components/PageHeader';
import PageFooter from '../../components/PageFooter';
import SiteCard from '../../components/SiteCard';
import { COLLECTIONS } from '@/lib/collections';

interface Props {
  params: Promise<{ slug: string }>;
}

const BASE_URL = 'https://allsitehub.site';

export async function generateStaticParams() {
  return COLLECTIONS.map(c => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const col = COLLECTIONS.find(c => c.slug === slug);
  if (!col) return { title: 'Collection Not Found' };

  const title = `${col.title} | AllSiteHub`;
  const description = `${col.description} Discover verified web tools, links, and resources on AllSiteHub.`;
  const canonicalUrl = `${BASE_URL}/collections/${slug}`;

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
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const col = COLLECTIONS.find(c => c.slug === slug);
  if (!col) notFound();

  const db = await readDB();
  const sites = db.sites.filter(s => s.category === col.category || col.slug === 'useful-websites');

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Collections',
        item: `${BASE_URL}/collections`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: col.title,
        item: `${BASE_URL}/collections/${slug}`,
      },
    ],
  };

  const collectionPageLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${col.title} | AllSiteHub`,
    description: col.description,
    url: `${BASE_URL}/collections/${slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'AllSiteHub',
      url: BASE_URL,
    },
    mainEntity: {
      '@type': 'ItemList',
      name: col.title,
      description: col.description,
      numberOfItems: sites.length,
      itemListElement: sites.map((site, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: site.name,
        url: `${BASE_URL}/site/${site.name.replace(/\s+/g, '-').replace(/&/g, 'and').toLowerCase()}`,
        ...(site.description ? { description: site.description } : {}),
      })),
    },
  };

  return (
    <div className="min-h-screen flex flex-col relative page-offset">
      <div className="noise-overlay" />
      <PageHeader active="Collections" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="relative overflow-hidden text-center px-4 pt-12 pb-8 sm:pt-16 sm:pb-12">
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[70%] h-[70%] bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-grid-lux opacity-20" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-lux mb-6 border border-white/10 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-[var(--text-primary)] transition-colors">Collections</Link>
            <span>/</span>
            <span className="text-blue-400 font-semibold">{col.title}</span>
          </nav>

          <div className="text-4xl mb-3">{col.icon}</div>
          <h1 className="font-headline text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight text-[var(--text-primary)]">
            {col.title}
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            {col.description}
          </p>
        </div>
      </section>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 w-full mb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-3.5 md:gap-4 w-full">
          {sites.map(site => (
            <div key={site.id} className="flex flex-col gap-2">
              <SiteCard site={site} />
            </div>
          ))}
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
