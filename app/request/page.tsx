'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, REGIONS } from '@/lib/data';
import PageHeader from '../components/PageHeader';
import PageFooter from '../components/PageFooter';

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
        item: 'https://allsitehub.site',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Request a Site',
        item: 'https://allsitehub.site/request',
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
          <div className="glass-lux border border-emerald-500/25 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl mx-auto mb-4">✅</div>
            <h2 className="font-headline text-xl font-bold text-[var(--text-primary)] tracking-tight mb-2">Request Submitted!</h2>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
              Thanks for submitting <strong className="text-[var(--text-primary)]">{siteName}</strong>. We&apos;ll review it and get back to you.
            </p>
            <div className="flex gap-2.5 justify-center flex-wrap">
              <button
                onClick={() => { setDone(false); setSiteUrl(''); setSiteName(''); setReason(''); setTargets([{ region: 'Global', category: CATEGORIES[0]?.name ?? 'Movies & Shows' }]); }}
                className="btn-brand"
              >
                Submit Another
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
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
