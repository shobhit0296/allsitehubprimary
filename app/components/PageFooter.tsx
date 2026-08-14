import Link from 'next/link';

export default function PageFooter() {
  return (
    <footer className="border-t border-white/5 py-10 mt-auto bg-[#05070f]/60">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="font-headline font-extrabold text-[var(--text-primary)] text-base">
              All<span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">Site</span>Hub
            </span>
            <span className="text-xs text-[var(--text-muted)]">— Universal Website Discovery Platform</span>
          </div>

          <nav aria-label="Footer" className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
            <Link href="/collections" className="hover:text-[var(--text-primary)] transition-colors">Collections</Link>
            <Link href="/how-we-review-websites" className="hover:text-[var(--text-primary)] transition-colors">Review Methodology</Link>
            <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">About</Link>
            <Link href="/request" className="hover:text-[var(--text-primary)] transition-colors">Request a Site</Link>
            <Link href="/dmca" className="hover:text-[var(--text-primary)] transition-colors">DMCA</Link>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()}{' '}
            <span className="text-blue-400 font-semibold">AllSiteHub</span>
            {' '}· Discover & Search Useful Websites · We do not host third-party content.
          </p>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" /> Systems Operational
          </span>
        </div>
      </div>
    </footer>
  );
}
