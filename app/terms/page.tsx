import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '../components/PageHeader';
import PageFooter from '../components/PageFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import JsonLd from '../components/JsonLd';
import { siteConfig } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Terms of Service — AllSiteHub',
  description:
    'Terms of service, directory disclaimer, and legal framework governing the use of the AllSiteHub website directory.',
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
  openGraph: {
    title: 'Terms of Service — AllSiteHub',
    description: 'Terms and conditions for utilizing the AllSiteHub directory platform.',
    url: `${siteConfig.url}/terms`,
    type: 'website',
  },
};

export default function TermsPage() {
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
        name: 'Terms of Service',
        item: `${siteConfig.url}/terms`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col relative page-offset">
      <div className="noise-overlay" />
      <PageHeader active="Terms" />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Terms of Service' },
        ]}
      />
      <JsonLd schema={breadcrumbLd} />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12 sm:py-16 w-full">
        <div className="glass-lux border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400 mb-4">
              Platform Terms
            </div>
            <h1 className="font-headline text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2">
              Last Updated: September 2026 · Effective Date: Immediately
            </p>
          </div>

          <section className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">1. Acceptance of Terms</h2>
            <p>
              By accessing or using <strong>{siteConfig.name}</strong> (&ldquo;AllSiteHub&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree with any part of these terms, please refrain from using our platform.
            </p>
          </section>

          <section className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">2. Nature of Service (Directory & Discovery)</h2>
            <p>
              AllSiteHub operates strictly as an <strong>informational directory and discovery portal</strong>. We curate, categorize, and organize hyperlinks to publicly accessible external websites, productivity tools, and online resources.
            </p>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
              <p className="font-semibold text-[var(--text-primary)]">⚠️ Content & Hosting Disclaimer:</p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                <li>AllSiteHub does NOT host, upload, store, transcode, or broadcast media files, video streams, or copyrighted content on our servers.</li>
                <li>AllSiteHub provides text hyperlinks to third-party destinations operated by independent third parties.</li>
                <li>We do not control, endorse, or assume responsibility for the content, privacy policies, or practices of any external third-party websites.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">3. Copyright & DMCA Compliance</h2>
            <p>
              AllSiteHub respects the intellectual property rights of creators and content owners. In accordance with the Digital Millennium Copyright Act (DMCA), we expeditiously process notices of alleged copyright infringement. If you believe your copyrighted work is indexed in our directory inappropriately, please review our detailed takedown procedure on our{' '}
              <Link href="/dmca" className="text-blue-400 hover:underline font-semibold">DMCA Policy Page</Link>.
            </p>
          </section>

          <section className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">4. User Conduct & Acceptable Use</h2>
            <p>
              When utilizing AllSiteHub or submitting suggestions via our Request Site system, you agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Submit malicious URLs, phishing portals, viruses, trojans, or unlawful destinations.</li>
              <li>Attempt to disrupt, overload, or compromise our hosting infrastructure through denial-of-service attacks or automated scraping loops.</li>
              <li>Submit repetitive or deceptive directory listings.</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">5. Editorial Discretion & Verification Standards</h2>
            <p>
              Inclusion of any website in the AllSiteHub directory is governed by our editorial guidelines detailed in our{' '}
              <Link href="/how-we-review-websites" className="text-blue-400 hover:underline font-semibold">Website Review Methodology</Link>. We reserve the absolute right to accept, reject, label, modify categorization, or delist any website at our discretion without prior notice.
            </p>
          </section>

          <section className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">6. Disclaimer of Warranties & Limitation of Liability</h2>
            <p>
              AllSiteHub is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, whether express or implied. In no event shall AllSiteHub, its founder, or contributors be liable for any direct, indirect, incidental, or consequential damages arising from your use of the directory or your reliance on external websites accessed through directory links.
            </p>
          </section>

          <section className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">7. Contact Information</h2>
            <p>
              For legal questions, listing inquiries, or feedback regarding these Terms of Service, please contact us at{' '}
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
