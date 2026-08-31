import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { readDB } from '@/lib/db';
import { CATEGORIES } from '@/lib/data';
import { siteConfig, slugify } from '@/lib/siteConfig';
import PageHeader from '../../components/PageHeader';
import PageFooter from '../../components/PageFooter';
import CategoryIcon from '../../components/CategoryIcon';
import CategorySiteGrid from '../../components/CategorySiteGrid';
import Breadcrumbs from '../../components/Breadcrumbs';
import JsonLd from '../../components/JsonLd';

interface Props {
  params: Promise<{ slug: string }>;
}

function findCategoryBySlug(slug: string) {
  return CATEGORIES.find(c => slugify(c.name) === slug);
}

export async function generateStaticParams() {
  return CATEGORIES.map(c => ({
    slug: slugify(c.name),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = findCategoryBySlug(slug);
  if (!cat) return { title: 'Category Not Found' };

  const title = `Best ${cat.name} Websites & Online Resources`;
  const description = `Explore curated ${cat.name} websites and online resources. Compare available sites, discover useful options and explore related resources on AllSiteHub.`;
  const canonicalUrl = `${siteConfig.url}/category/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
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
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = findCategoryBySlug(slug);
  if (!cat) notFound();

  const db = await readDB();
  const categorySites = db.sites.filter(s => s.category === cat.name);

  const collectionPageLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Best ${cat.name} Websites & Tools | AllSiteHub`,
    description: `Explore curated ${cat.name} websites on AllSiteHub. ${cat.description}`,
    url: `${siteConfig.url}/category/${slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntity: {
      '@type': 'ItemList',
      name: `Best ${cat.name} Websites`,
      description: cat.description,
      numberOfItems: categorySites.length,
      itemListElement: categorySites.map((site, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: site.name,
        url: `${siteConfig.url}/site/${slugify(site.name)}`,
        ...(site.description ? { description: site.description } : {}),
      })),
    },
  };

  return (
    <div className="min-h-screen flex flex-col relative page-offset">
      <div className="noise-overlay" />
      <PageHeader active={cat.name} />
      <Breadcrumbs items={[{ label: 'Categories', href: '/#categories' }, { label: cat.name }]} />

      <JsonLd schema={collectionPageLd} />

      {/* ── Hero Header ──────────────────────────────── */}
      <section className="relative overflow-hidden text-center px-4 pt-12 pb-10 sm:pt-16 sm:pb-14">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[80%] h-[70%] bg-blue-500/8 blur-[140px] rounded-full" />
          <div className="absolute top-[20%] left-[15%] w-[30%] h-[40%] bg-violet-500/6 blur-[100px] rounded-full" />
          <div className="absolute inset-0 bg-grid-lux opacity-20" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-lux mb-6 border border-white/10 text-xs text-[var(--text-muted)]"
          >
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
            <span className="opacity-40">/</span>
            <span className="text-blue-400 font-semibold">{cat.name}</span>
          </nav>

          {/* Category icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1.5px solid rgba(99,102,241,0.3)' }}
            >
              <CategoryIcon name={cat.name} size={36} />
            </div>
          </div>

          <h1 className="font-headline text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight text-[var(--text-primary)]">
            Best <span className="gradient-text">{cat.name}</span> Websites
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-6">
            {cat.description} Explore{' '}
            <strong className="text-[var(--text-primary)]">{categorySites.length} verified websites</strong> in this collection.
          </p>

          {/* Stats pills */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-lux border border-white/10 text-xs font-semibold text-[var(--text-secondary)]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-400">
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              <span>{categorySites.length} Sites Verified</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-lux border border-white/10 text-xs font-semibold text-[var(--text-secondary)]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
              <span>Real Logos</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sites Grid ────────────────────────────────── */}
      <main className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 w-full mb-20">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.08] flex-wrap gap-4">
          <h2 className="font-headline text-xl font-bold text-[var(--text-primary)] flex items-center gap-2.5">
            <CategoryIcon name={cat.name} size={22} />
            <span>Curated {cat.name} Directory</span>
          </h2>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400">
            {categorySites.length} Sites
          </span>
        </div>

        <CategorySiteGrid sites={categorySites} />

        {/* Other Categories */}
        <div className="mt-20 pt-10 border-t border-white/[0.08]">
          <h3 className="font-headline text-lg font-bold text-[var(--text-primary)] mb-5">
            Explore Other Categories
          </h3>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.filter(c => c.name !== cat.name).map(other => (
              <Link
                key={other.name}
                href={`/category/${slugify(other.name)}`}
                className="chip glass-lux hover:border-blue-500/40 transition-all text-xs flex items-center gap-2"
              >
                <span>{other.icon}</span>
                <span>{other.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
