import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '../components/PageHeader';
import PageFooter from '../components/PageFooter';
import { siteConfig } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'How We Review Websites — AllSiteHub Quality & Verification Standard',
  description: 'Learn about the AllSiteHub Website Review Methodology. We inspect website security, uptime, ad intrusion limits, content quality, and mobile UX before listing.',
  alternates: {
    canonical: `${siteConfig.url}/how-we-review-websites`,
  },
  openGraph: {
    title: 'How We Review Websites — AllSiteHub Quality Standard',
    description: 'Our transparent 5-step methodology for evaluating and verifying websites listed on AllSiteHub.',
    url: `${siteConfig.url}/how-we-review-websites`,
  },
};

const CRITERIA = [
  {
    icon: '🔒',
    title: '1. Security & HTTPS Protocols',
    desc: 'We verify that listed websites utilize valid SSL encryption (HTTPS) and check domain reputations to ensure visitors are protected against phishing and dangerous scripts.',
  },
  {
    icon: '🛡️',
    title: '2. Intrusive Ad & Malware Scans',
    desc: 'Websites featuring excessive pop-ups, automatic malicious downloads, or aggressive ad redirects fail our evaluation and are removed or rejected.',
  },
  {
    icon: '⚡',
    title: '3. Availability & Uptime Checks',
    desc: 'Our monitoring checks site domain responsiveness and uptime. Offline or abandoned websites are delisted to ensure users find active, working resources.',
  },
  {
    icon: '🎯',
    title: '4. Content Library & Genuine Utility',
    desc: 'Every website must offer real utility, active content libraries, or functional web tools. We reject duplicate doorway sites or thin template farms.',
  },
  {
    icon: '📱',
    title: '5. Mobile & Cross-Device Usability',
    desc: 'Sites are tested across mobile viewports, tablets, and desktop browsers to verify that key controls and navigation operate smoothly across devices.',
  },
];

export default function ReviewMethodologyPage() {
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
        name: 'How We Review Websites',
        item: `${siteConfig.url}/how-we-review-websites`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col relative page-offset">
      <div className="noise-overlay" />
      <PageHeader active="Methodology" />

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
            <span className="text-blue-400 font-semibold">How We Review Websites</span>
          </nav>

          <h1 className="font-headline text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight text-[var(--text-primary)]">
            How We Review & <span className="gradient-text">Verify Websites</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            At AllSiteHub, we prioritize quality, security, and genuine usefulness. Here is our transparent 5-step evaluation process for every website listed on our platform.
          </p>
        </div>
      </section>

      <main className="max-w-[840px] mx-auto px-4 pb-20 flex flex-col gap-10 w-full">
        <div className="grid grid-cols-1 gap-4">
          {CRITERIA.map(c => (
            <div key={c.title} className="glass-lux border border-white/10 rounded-2xl p-6 flex items-start gap-4">
              <div className="text-3xl shrink-0">{c.icon}</div>
              <div>
                <h2 className="font-headline text-base font-bold text-[var(--text-primary)] mb-1.5">{c.title}</h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reporting Section */}
        <div className="glass-lux border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="text-3xl mb-2.5">🚨</div>
          <h2 className="font-headline text-lg font-bold text-[var(--text-primary)] mb-2">Report a Broken or Unsafe Listing</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-md mx-auto">
            Notice a broken site, unexpected pop-up, or security concern? Help us maintain listing standards by sending a report.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/request" className="btn-brand px-6 py-2.5 rounded-full text-xs font-bold">
              Report / Request Site
            </Link>
            <a href="mailto:allsitehubsupport@gmail.com" className="px-6 py-2.5 glass-lux border border-white/10 rounded-full text-xs font-bold text-[var(--text-secondary)]">
              Contact Editorial Team
            </a>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
