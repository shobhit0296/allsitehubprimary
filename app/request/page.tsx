'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, REGIONS } from '@/lib/data';
import PageHeader from '../components/PageHeader';
import PageFooter from '../components/PageFooter';
import { siteConfig } from '@/lib/siteConfig';

interface Target { region: string; category: string; }

const LOOK_FOR = [
  'Working, active sites',
  'Good content library',
  'User-friendly interface',
  'Mobile compatibility',
  'Minimal intrusive ads',
];
const AVOID = [
  'Broken or offline sites',
  'Excessive pop-ups / malware',
  'Scam or phishing sites',
  'Paid sites (exceptions apply)',
];

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-[var(--text-muted)]";
const selectCls = "bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none";
const labelCls = "flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-secondary)] mb-2";

export default function RequestPage() {
  const [siteUrl, setSiteUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [reason, setReason] = useState('');
  const [hpField, setHpField] = useState(''); // Honeypot bot trap
  const [targets, setTargets] = useState<Target[]>([{ region: 'Global', category: CATEGORIES[0]?.name ?? 'Movies & Shows' }]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const addTarget = () => setTargets(prev => [...prev, { region: 'Global', category: CATEGORIES[0]?.name ?? 'Movies & Shows' }]);
  const removeTarget = (i: number) => setTargets(prev => prev.filter((_, idx) => idx !== i));
  const updateTarget = (i: number, key: keyof Target, val: string) =>
    setTargets(prev => prev.map((t, idx) => idx === i ? { ...t, [key]: val } : t));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteUrl.trim() || !siteName.trim()) { setError('Please enter both the site URL and name.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl, siteName, targets, reason, hp_field: hpField }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const err = await res.json();
        setError(err.error ?? 'Something went wrong. Try again.');
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setSubmitting(false); }
  };

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
        name: 'Request a Site',
        item: `${siteConfig.url}/request`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col relative page-offset">
      <div className="noise-overlay" />
      <PageHeader active="Request" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden text-center px-4 pt-10 pb-2 sm:pt-12">
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[70%] h-[70%] bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-grid-lux opacity-20" />
        </div>
        <div className="relative z-10">
          <h1 className="font-headline text-3xl sm:text-4xl font-bold mb-2 tracking-tight text-[var(--text-primary)]">
            Request a <span className="gradient-text">Site</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">Help us grow the collection.</p>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-4 my-8 w-full request-grid">
        {/* LEFT: Form */}
        {done ? (
          <div className="glass-lux border border-emerald-500/25 rounded-2xl p-7 sm:p-9 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl mx-auto mb-4">✅</div>
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-2">Request Submitted!</h2>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 max-w-md mx-auto">
              Thanks for submitting <strong className="text-[var(--text-primary)]">{siteName}</strong>. Your request is queued for editorial review.
            </p>

            {/* ⚡ INFORM NOW SECTION */}
            <div className="bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-violet-600/15 border border-blue-500/30 rounded-2xl p-5 sm:p-6 mb-7 text-left shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[12px] font-bold uppercase tracking-wider text-blue-400">Expedite Your Listing</span>
              </div>
              <h3 className="font-headline text-base sm:text-lg font-bold text-[var(--text-primary)] mb-1.5">
                ⚡ Inform Us Now on Discord &amp; Telegram
              </h3>
              <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">
                Want immediate priority review? Reach out directly to our curation team. Send us your website link and details on Discord or Telegram so we can verify and list your site faster:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* Discord Button */}
                <a
                  href={siteConfig.social.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-bold text-sm text-white bg-[#5865F2] hover:bg-[#4752C4] shadow-md transition-all duration-200 hover:scale-[1.02]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  <span>Inform on Discord</span>
                </a>

                {/* Telegram Button */}
                <a
                  href={siteConfig.social.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-bold text-sm text-white bg-[#229ED9] hover:bg-[#1A8BC2] shadow-md transition-all duration-200 hover:scale-[1.02]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span>Inform on Telegram</span>
                </a>
              </div>

              <div className="bg-black/25 border border-white/10 rounded-xl p-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="truncate pr-2">Tip: Mention site name &ldquo;<strong>{siteName}</strong>&rdquo; when messaging</span>
                <span className="text-emerald-400 font-bold shrink-0">⚡ Fast-Track</span>
              </div>
            </div>

            <div className="flex gap-2.5 justify-center flex-wrap">
              <button
                onClick={() => { setDone(false); setSiteUrl(''); setSiteName(''); setReason(''); setTargets([{ region: 'Global', category: CATEGORIES[0]?.name ?? 'Movies & Shows' }]); }}
                className="btn-brand"
              >
                Submit Another Site
              </button>
              <Link href="/" className="px-5 py-2.5 glass-lux border border-white/10 rounded-xl text-[var(--text-secondary)] text-sm font-bold inline-flex items-center">
                ← Back Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass-lux border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl">
            <h2 className="font-headline text-base font-bold text-[var(--text-primary)] tracking-tight mb-6">Submit your request</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
              {/* Invisible Honeypot Anti-Bot Field */}
              <input
                type="text"
                name="hp_field"
                value={hpField}
                onChange={e => setHpField(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <div>
                <label className={labelCls}><span className="text-[13px]">🌐</span> Site URL</label>
                <input
                  type="url"
                  required
                  value={siteUrl}
                  onChange={e => setSiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}><span className="text-[13px]">✦</span> Site Name</label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={e => setSiteName(e.target.value)}
                  placeholder="Awesome Streaming Site"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>
                  <span className="text-[13px]">🗂️</span> Where should it go?
                  <span className="text-[var(--text-muted)] font-normal text-[11px] ml-1.5">(add as many region + category pairs as you like)</span>
                </label>
                <div className="flex flex-col gap-2">
                  {targets.map((t, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select
                        value={t.region}
                        onChange={e => updateTarget(i, 'region', e.target.value)}
                        className={`${selectCls} flex-1`}
                      >
                        {REGIONS.map(r => <option key={r} value={r} style={{ background: '#0c1324' }}>{r}</option>)}
                      </select>
                      <select
                        value={t.category}
                        onChange={e => updateTarget(i, 'category', e.target.value)}
                        className={`${selectCls} flex-1`}
                      >
                        {CATEGORIES.map(c => <option key={c.name} value={c.name} style={{ background: '#0c1324' }}>{c.icon} {c.name}</option>)}
                      </select>
                      {targets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTarget(i)}
                          className="bg-rose-500/10 border border-rose-500/20 rounded-lg w-9 h-9 flex items-center justify-center text-rose-400 text-base shrink-0"
                        >×</button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTarget}
                    className="self-start border border-dashed border-white/15 rounded-lg px-3.5 py-1.5 text-[var(--text-muted)] text-xs flex items-center gap-1.5 hover:text-blue-400 hover:border-blue-500/40 transition-colors"
                  >
                    + Add another region/section
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}><span className="text-[13px]">💬</span> Why should we add it?</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={4}
                  placeholder="Tell us what makes this site special... (large library, fast streaming, mobile-friendly, etc.)"
                  className={`${inputCls} resize-y min-h-[96px] leading-relaxed`}
                />
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-3.5 py-2.5 text-rose-400 text-[13px]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`btn-brand w-full sm:w-auto ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <><span>✦</span> Submit request</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* RIGHT: Guidelines */}
        <div className="flex flex-col gap-4">
          <div className="glass-lux border border-white/10 rounded-2xl p-6">
            <h3 className="text-[15px] font-bold text-[var(--text-primary)] tracking-tight mb-4">Submission guidelines</h3>

            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-[18px] h-[18px] rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <span className="text-[13px] font-bold text-emerald-400">We look for</span>
              </div>
              <ul className="list-none flex flex-col gap-2">
                {LOOK_FOR.map(item => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                    <span className="w-[5px] h-[5px] rounded-full bg-emerald-400 shrink-0 inline-block" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-px bg-white/5 mb-5" />

            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-[18px] h-[18px] rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </div>
                <span className="text-[13px] font-bold text-rose-400">We avoid</span>
              </div>
              <ul className="list-none flex flex-col gap-2">
                {AVOID.map(item => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                    <span className="w-[5px] h-[5px] rounded-full bg-rose-400 shrink-0 inline-block" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-blue-500/[0.06] border border-blue-500/20 rounded-xl p-4">
            <div className="text-[11px] font-bold text-blue-400 tracking-widest uppercase mb-1.5">💡 Pro Tip</div>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Requests with a detailed reason are reviewed much faster. Include why the site is unique!
            </p>
          </div>

          {/* Webmaster Priority Support */}
          <div className="glass-lux border border-indigo-500/25 rounded-2xl p-5 bg-gradient-to-b from-indigo-500/[0.07] to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">⚡</span>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Inform Us Directly</h4>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
              Webmasters &amp; curators: Ping us directly on Discord or Telegram to expedite listing verification.
            </p>
            <div className="flex gap-2">
              <a
                href={siteConfig.social.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-white bg-[#5865F2] hover:bg-[#4752c4] transition-colors"
              >
                Discord
              </a>
              <a
                href={siteConfig.social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-white bg-[#229ED9] hover:bg-[#1a8bc2] transition-colors"
              >
                Telegram
              </a>
            </div>
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
