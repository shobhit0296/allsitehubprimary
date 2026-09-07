import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '../components/PageHeader';
import PageFooter from '../components/PageFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import JsonLd from '../components/JsonLd';
import { siteConfig } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Privacy Policy — AllSiteHub',
  description:
    'Learn how AllSiteHub handles user data, cookies, third-party advertising partners like Google AdSense, and analytics.',
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy — AllSiteHub',
    description: 'Privacy Policy and data protection standards for AllSiteHub visitors.',
    url: `${siteConfig.url}/privacy`,
    type: 'website',
  },
};

export default function PrivacyPage() {
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
        name: 'Privacy Policy',
        item: `${siteConfig.url}/privacy`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col relative page-offset">
      <div className="noise-overlay" />
      <PageHeader active="Privacy" />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Privacy Policy' },
        ]}
      />
      <JsonLd schema={breadcrumbLd} />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12 sm:py-16 w-full">
        <div className="glass-lux border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-4">
              Legal Transparency
            </div>
            <h1 className="font-headline text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2">
              Last Updated: September 2026 · Effective Date: Immediately
            </p>
          </div>

          <section className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">1. Overview</h2>
            <p>
              Welcome to <strong>{siteConfig.name}</strong> (&ldquo;AllSiteHub&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), accessible at{' '}
              <Link href="/" className="text-blue-400 hover:underline">{siteConfig.url}</Link>. We respect your personal privacy and are committed to maintaining transparent data practices. This Privacy Policy details the types of information collected when you browse our website discovery directory and explains how that information is utilized.
            </p>
          </section>

          <section className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">2. Information We Collect</h2>
            <p>
              AllSiteHub is designed for direct exploration without mandatory user account registration. We do not require visitors to provide names, physical addresses, or payment credentials to browse directory listings.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                <strong>Voluntary Submissions:</strong> If you submit a website via our Request Site form or contact us via email, we collect the submitted URL, category selection, and optional remarks solely to process and review your listing recommendation.
              </li>
              <li>
                <strong>Log Data:</strong> Like standard web servers, our infrastructure records non-personally identifiable log information including browser type, operating system, referring pages, timestamps, and generalized request parameters to diagnose technical issues and optimize performance.
              </li>
            </ul>
          </section>

          <section className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">3. Google AdSense & Advertising Cookies</h2>
            <p>
              We display advertisements on our website through authorized advertising partners, including <strong>Google AdSense</strong> and verified advertising networks.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites across the Internet.
              </li>
              <li>
                Google&apos;s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to AllSiteHub and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Google Ads Settings
                </a>. Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting{' '}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  aboutads.info
                </a>.
              </li>
            </ul>
          </section>

          <section className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">4. Web Analytics (Google Analytics 4)</h2>
            <p>
              We utilize <strong>Google Analytics 4</strong> to understand aggregate site traffic patterns, popular directory categories, and user navigation trends. Google Analytics utilizes first-party cookies to report on visitor interactions without storing personally identifiable information. IP anonymization protocols are enforced.
            </p>
          </section>

          <section className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">5. Third-Party Outbound Links</h2>
            <p>
              AllSiteHub is a curated directory providing links to external, third-party websites across the Internet. Once you click an outbound link to leave AllSiteHub, you are subject to the privacy practices and terms of that external destination. We strongly encourage you to inspect the privacy notices of any third-party website you visit.
            </p>
          </section>

          <section className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">6. Data Security</h2>
            <p>
              All traffic to AllSiteHub is encrypted in transit using industry-standard TLS/HTTPS protocols with strict transport security (HSTS). We implement continuous threat monitoring and security headers to protect visitor sessions.
            </p>
          </section>

          <section className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">7. Contact & Inquiries</h2>
            <p>
              If you have any questions or privacy inquiries regarding this Privacy Policy, you may contact our editorial team directly at{' '}
              <a href={`mailto:${siteConfig.contact.email}`} className="text-blue-400 hover:underline font-semibold">
                {siteConfig.contact.email}
              </a>.
            </p>
          </section>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
