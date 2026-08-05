import PageHeader from '../components/PageHeader';
import PageFooter from '../components/PageFooter';

const STEPS = [
  { n: 1, title: 'Review',  desc: 'We review all valid DMCA requests submitted via email.' },
  { n: 2, title: 'Verify',  desc: 'We verify that all required information is included.' },
  { n: 3, title: 'Action',  desc: 'We remove links to infringing content when appropriate.' },
  { n: 4, title: 'Notify',  desc: 'We notify you of the action taken on your request.' },
];

const REQUIREMENTS = [
  { title: 'Description of Copyrighted Work', desc: 'A description of the copyrighted work that you claim is being infringed.' },
  { title: 'Location of Infringing Material', desc: 'The URL(s) or location of the material you claim is infringing, with enough detail to locate it.' },
  { title: 'Your Contact Information', desc: 'Your name, title (if acting as an agent), address, telephone number, and email address.' },
  { title: 'Good Faith Statement', desc: '"I have a good faith belief that the use of the copyrighted material I am complaining of is not authorized by the copyright owner, its agent, or the law."', quote: true },
  { title: 'Accuracy Statement', desc: '"The information in this notice is accurate and, under penalty of perjury, I am the owner, or authorized to act on behalf of the owner."', quote: true },
  { title: 'Legal Accountability Statement', desc: '"I understand that I am subject to legal action upon submitting a DMCA request without solid proof."', quote: true },
  { title: 'Signature', desc: 'An electronic or physical signature of the copyright owner or an authorized agent.' },
];

export default function DmcaPage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="noise-overlay" />
      <PageHeader active="DMCA" />

      {/* Hero */}
      <section className="relative overflow-hidden text-center px-4 py-14 sm:py-16">
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[70%] h-[70%] bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-grid-lux opacity-20" />
        </div>
        <div className="relative z-10">
          <h1 className="font-headline text-3xl sm:text-4xl font-bold mb-2.5 tracking-tight text-[var(--text-primary)]">
            DMCA <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm flex items-center justify-center gap-1.5">
            Copyright Takedown Requests <span className="text-base">🛡️</span>
          </p>
        </div>
      </section>

      <div className="max-w-[760px] mx-auto px-4 pb-20 flex flex-col gap-9 w-full">
        {/* Overview */}
        <div className="glass-lux border border-white/10 rounded-2xl p-7">
          <h2 className="font-headline text-base font-bold text-[var(--text-primary)] tracking-tight mb-3.5">DMCA Overview</h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3.5">
            We take intellectual property rights seriously and comply with the Digital Millennium Copyright Act (DMCA).
            If you believe content linked from our site infringes your copyright, follow the procedure below.
          </p>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            <strong className="text-[var(--text-primary)] font-semibold">Please Note: </strong>
            Allsitehub is a directory service that provides links to third-party sites. We do not host, store, or control any content.
          </p>
        </div>

        {/* Steps */}
        <div>
          <h2 className="font-headline text-base font-bold text-[var(--text-primary)] tracking-tight mb-4">How We Handle DMCA Requests</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STEPS.map(step => (
              <div key={step.n} className="glass-lux border border-white/10 rounded-2xl p-5 text-center relative overflow-hidden card-hover-lux">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500" />
                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center mx-auto mb-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20">
                  {step.n}
                </div>
                <div className="text-sm font-bold text-blue-400 mb-1.5">{step.title}</div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div>
          <h2 className="font-headline text-base font-bold text-[var(--text-primary)] tracking-tight mb-4">DMCA Request Requirements</h2>
          <div className="glass-lux border border-white/10 rounded-2xl overflow-hidden">
            {REQUIREMENTS.map((req, i) => (
              <div key={req.title} className={`p-5 sm:p-6 flex gap-3.5 items-start hover:bg-white/[0.02] transition-colors ${i < REQUIREMENTS.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-400" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">{req.title}</div>
                  <p className={`text-[13px] text-[var(--text-secondary)] leading-relaxed ${req.quote ? 'italic' : ''}`}>{req.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="glass-lux border border-white/10 rounded-2xl p-9 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="text-3xl mb-2.5">📧</div>
            <h2 className="font-headline text-lg font-bold text-[var(--text-primary)] tracking-tight mb-2">Submit DMCA Request</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-6">Please send your DMCA takedown notice to:</p>
            <a
              href="mailto:allsitehubsupport@gmail.com"
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full px-7 py-3 text-white font-headline font-bold text-sm shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              allsitehubsupport@gmail.com
            </a>
            <p className="text-[var(--text-muted)] text-xs mt-4.5 leading-relaxed">
              We will promptly investigate and take appropriate action in accordance with the DMCA.
            </p>
            <div className="inline-flex items-center gap-1.5 mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1.5">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-emerald-400 text-xs font-medium">Typical response within 48–72 hours</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[var(--text-muted)] text-xs leading-relaxed">
          This DMCA policy is effective as of the launch of Allsitehub.<br />
          We reserve the right to update this policy at any time without notice.
        </p>
      </div>

      <PageFooter />
    </div>
  );
}
