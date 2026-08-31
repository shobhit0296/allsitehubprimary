import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '../components/PageHeader';
import PageFooter from '../components/PageFooter';
import { COLLECTIONS } from '@/lib/collections';

const BASE_URL = 'https://allsitehub.site';

export const metadata: Metadata = {
  title: 'Curated Website Collections & Guides',
  description: 'Explore hand-picked website collections on AllSiteHub. Discover the best AI tools, developer websites, productivity tools, and useful web resources.',
  alternates: {
    canonical: `${BASE_URL}/collections`,
  },
  openGraph: {
    title: 'Curated Website Collections & Guides — AllSiteHub',
    description: 'Explore hand-picked website collections on AllSiteHub. Discover top tools, software, and web resources.',
    url: `${BASE_URL}/collections`,
  },
};

export default function CollectionsIndexPage() {
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
    ],
  };

  return (
    <div className="min-h-screen flex flex-col relative page-offset">
      <div className="noise-overlay" />
      <PageHeader active="Collections" />

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
            <span className="text-blue-400 font-semibold">Collections</span>
          </nav>

          <h1 className="font-headline text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight text-[var(--text-primary)]">
            Curated Website <span className="gradient-text">Collections</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Editorial selections of the best tools, software, and useful web destinations hand-picked by AllSiteHub.
          </p>
        </div>
      </section>

      <main className="max-w-[1100px] mx-auto px-4 pb-20 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COLLECTIONS.map(col => (
            <Link
              key={col.slug}
              href={`/collections/${col.slug}`}
              className="glass-lux border border-white/10 rounded-2xl p-7 card-hover-lux flex flex-col justify-between"
            >
              <div>
                <div className="text-4xl mb-3">{col.icon}</div>
                <h2 className="font-headline text-xl font-bold text-[var(--text-primary)] mb-2">{col.title}</h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{col.description}</p>
              </div>
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 self-start">
                Explore Collection →
              </span>
            </Link>
          ))}
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
