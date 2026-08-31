import Link from 'next/link';
import { SITES, CATEGORIES, REGIONS } from '@/lib/data';
import PageHeader from '../components/PageHeader';
import PageFooter from '../components/PageFooter';

const STATS = [
  { value: SITES.length,      label: 'Sites Listed', icon: '📡', color: 'text-blue-400' },
  { value: CATEGORIES.length, label: 'Categories',   icon: '🗂️', color: 'text-violet-400' },
  { value: REGIONS.length,    label: 'Regions',      icon: '🌍', color: 'text-emerald-400' },
  { value: '100%',            label: 'Free to Use',  icon: '✨', color: 'text-fuchsia-400' },
];

const VALUES = [
  { icon: '🔍', title: 'Curated, Not Scraped', desc: 'Every site is manually reviewed before being added. We prioritize quality over quantity.' },
  { icon: '🌏', title: 'Multi-Region Support', desc: 'Filter sites by your region — we support 16 countries and growing.' },
  { icon: '⚡', title: 'Always Updated', desc: 'Our team regularly reviews and updates listings to remove dead or unsafe sites.' },
  { icon: '🛡️', title: 'Transparent', desc: 'We clearly label sites as Trusted, New, or Featured so you know what to expect.' },
  { icon: '📱', title: 'Mobile Friendly', desc: 'Allsitehub works perfectly on any device — phone, tablet, or desktop.' },
  { icon: '🚫', title: 'No Hosting', desc: "We don't host any content. We're purely a directory of links to existing sites." },
];

const FAQS = [
  { q: 'Is Allsitehub free?', a: 'Yes, completely free. No sign-up, no subscription, no ads.' },
  { q: 'Do you host movies or shows?', a: 'No. Allsitehub is a directory — we only link to third-party streaming sites. We do not host, store, or control any content.' },
  { q: 'How do I suggest a site?', a: 'Go to our Request page and fill in the form. We review all submissions and add sites that meet our quality standards.' },
  { q: 'How are sites marked as "Trusted"?', a: 'Trusted sites are well-established platforms with a clean track record, good content libraries, and minimal intrusive ads or malware.' },
  { q: 'I found a broken or unsafe site. What do I do?', a: 'Use the Request page to report it, or email us directly. We will review and remove it promptly.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col relative page-offset">
      <div className="noise-overlay" />
      <PageHeader active="About" />

      {/* Hero */}
      <section className="relative overflow-hidden text-center px-4 py-16 sm:py-20">
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[70%] h-[70%] bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-grid-lux opacity-20" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-lux mb-6 border border-white/10">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-blue-400">About Allsitehub</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-5xl font-bold mb-5 leading-tight tracking-tight text-[var(--text-primary)]">
            The streaming directory<br />
            <span className="gradient-text">built for everyone</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-8">
            Allsitehub is a free, curated directory of the best streaming sites on the internet —
            movies, anime, manga, live TV, sports, and more.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full px-7 py-3 text-white font-headline font-bold text-sm shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
              Browse Sites →
            </Link>
            <Link href="/request" className="inline-flex items-center gap-2 glass-lux border border-white/10 rounded-full px-7 py-3 text-[var(--text-secondary)] font-headline font-bold text-sm hover:bg-white/5 hover:scale-105 transition-all">
              Request a Site
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-[820px] mx-auto px-4 pb-20 flex flex-col gap-14 w-full">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map(s => (
            <div key={s.label} className="glass-lux rounded-2xl p-5 text-center relative overflow-hidden border border-white/10">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500" />
              <div className="text-xl mb-1.5">{s.icon}</div>
              <div className={`font-headline text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div>
          <h2 className="font-headline text-lg font-bold text-[var(--text-primary)] tracking-tight mb-4">Our Mission</h2>
          <div className="glass-lux border border-white/10 border-l-2 border-l-blue-500 rounded-2xl p-7">
            <p className="text-[var(--text-secondary)] text-sm leading-loose mb-3.5">
              The internet is full of streaming sites — but finding <em>good</em> ones is hard.
              Some are broken, some are unsafe, and many are just plain bad. Allsitehub exists to solve that.
            </p>
            <p className="text-[var(--text-secondary)] text-sm leading-loose">
              We manually curate and verify every site we list. No automated scraping. No pay-to-list schemes.
              Just an honest, up-to-date directory you can actually trust.
            </p>
          </div>
        </div>

        {/* Founder & Ownership */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-lg font-bold text-[var(--text-primary)] tracking-tight">Founder & Ownership</h2>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-400 glass-lux px-3 py-1 rounded-full border border-blue-500/20">
              Verified Leadership
            </span>
          </div>
          
          <div className="glass-lux border border-white/10 rounded-2xl p-7 sm:p-8 relative overflow-hidden card-hover-lux">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-violet-500/10 blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 p-[2px] shadow-xl shadow-blue-500/20">
                  <div className="w-full h-full bg-[#070b19] rounded-2xl flex items-center justify-center text-3xl sm:text-4xl select-none">
                    👨‍💻
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-[10px] font-bold text-white px-2 py-0.5 rounded-full border-2 border-[#070b19] flex items-center gap-1 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Owner
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h3 className="font-headline text-xl font-bold text-[var(--text-primary)]">Shobhit Verma</h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400">
                    Founder & Lead Curator
                  </span>
                </div>
                <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed mb-4">
                  Shobhit is the founder, architect, and lead editor behind AllSiteHub. Dedicated to building an open, honest, and clutter-free web discovery ecosystem, he actively oversees platform curation, link verification standards, user feature requests, and edge infrastructure.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="mailto:allsitehubsupport@gmail.com"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-full transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    allsitehubsupport@gmail.com
                  </a>
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                    📍 Independent Web Project · Global Operations
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[var(--text-secondary)]">
              <div className="flex items-start gap-2.5">
                <span className="text-blue-400 text-sm">⚖️</span>
                <span>
                  <strong className="text-[var(--text-primary)] block mb-0.5">Ownership & Independence</strong>
                  AllSiteHub is 100% independently owned, self-funded, and managed without third-party influence or sponsored rankings.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-violet-400 text-sm">🛡️</span>
                <span>
                  <strong className="text-[var(--text-primary)] block mb-0.5">Editorial Integrity</strong>
                  Every directory inclusion adheres to strict safety, uptime, and minimal ad-intrusion evaluation benchmarks.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <h2 className="font-headline text-lg font-bold text-[var(--text-primary)] tracking-tight mb-4">What Makes Us Different</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {VALUES.map(v => (
              <div key={v.title} className="glass-lux border border-white/10 rounded-2xl p-5 card-hover-lux">
                <div className="text-2xl mb-2.5">{v.icon}</div>
                <div className="text-sm font-bold text-[var(--text-primary)] mb-1.5">{v.title}</div>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="font-headline text-lg font-bold text-[var(--text-primary)] tracking-tight mb-4">Frequently Asked Questions</h2>
          <div className="glass-lux border border-white/10 rounded-2xl overflow-hidden">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className={`p-5 sm:p-6 hover:bg-white/[0.02] transition-colors ${i < FAQS.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="w-[22px] h-[22px] rounded-md bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[11px] font-extrabold text-blue-400">Q</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">{faq.q}</div>
                    <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="glass-lux border border-white/10 rounded-2xl p-9 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="text-3xl mb-2.5">💬</div>
            <h2 className="font-headline text-lg font-bold text-[var(--text-primary)] tracking-tight mb-2">Still have questions?</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-6">Reach out to us anytime — we are happy to help.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href="mailto:allsitehubsupport@gmail.com"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full px-6 py-2.5 text-white font-semibold text-[13px] shadow-lg shadow-blue-500/20"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                allsitehubsupport@gmail.com
              </a>
              <Link href="/request" className="inline-flex items-center gap-2 glass-lux border border-white/10 rounded-full px-6 py-2.5 text-[var(--text-secondary)] font-semibold text-[13px]">
                Request a Site
              </Link>
            </div>
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
