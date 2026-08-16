interface HeroProps {
  totalSites: number;
  totalCategories: number;
  totalRegions: number;
  regionFlag: string;
  activeRegion: string;
  filteredCount: number;
  totalUsers?: number;
  onlineCount?: number;
}

export default function Hero({
  totalSites,
  totalCategories,
  totalRegions,
  regionFlag,
  activeRegion,
  filteredCount,
  totalUsers = 128450,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden w-full">
      {/* Background decor */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-[25%] -left-[12%] w-[75%] sm:w-[65%] h-[65%] blur-[120px] rounded-full transition-colors duration-500"
          style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', opacity: 0.2 }}
        />
        <div
          className="absolute top-[25%] -right-[12%] w-[65%] sm:w-[55%] h-[55%] blur-[120px] rounded-full transition-colors duration-500"
          style={{ background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)', opacity: 0.18 }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] sm:w-[80%] h-[30%] blur-[100px] rounded-full transition-colors duration-500"
          style={{ background: 'radial-gradient(circle, var(--glow) 0%, transparent 70%)', opacity: 0.15 }}
        />
        <div className="absolute inset-0 bg-grid-lux opacity-[0.12] sm:opacity-[0.15]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center page-offset-search lg:page-offset pb-14 sm:pb-20 lg:pb-28">
        {/* Left — headline */}
        <div className="w-full min-w-0">
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full glass-lux mb-5 sm:mb-7 border border-white/10 max-w-full">
            <span className="pulse-dot w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" />
            <span className="text-[10.5px] sm:text-[11.5px] font-bold tracking-[0.08em] sm:tracking-[0.1em] uppercase text-[var(--text-accent)] truncate">
              Website Discovery Platform
            </span>
          </div>

          <h1 className="font-headline text-[2.15rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.15rem] font-extrabold mb-4 sm:mb-6 leading-[1.12] sm:leading-[1.08] tracking-[-0.03em] text-[var(--text-primary)]">
            Discover Websites.{' '}
            <span className="gradient-text">Search Smarter.</span>
          </h1>

          <p className="text-[0.98rem] sm:text-[1.12rem] lg:text-[1.2rem] text-[var(--text-secondary)] mb-6 sm:mb-8 max-w-[580px] leading-[1.65]">
            AllSiteHub helps you discover useful websites across the internet. Search, explore and refine websites by category to quickly find the tools, resources and online platforms you&apos;re looking for.
          </p>

          {/* ── Community CTAs ── */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 mb-6 sm:mb-8 w-full">
            {/* Discord */}
            <a
              href="https://discord.gg/EDH5ScSsv"
              target="_blank"
              rel="noopener noreferrer"
              className="social-cta-btn social-cta-discord group w-full sm:w-auto min-w-0 sm:min-w-[160px] touch-manipulation"
              aria-label="Join our Discord community"
            >
              <span className="social-cta-icon-wrap social-cta-discord-icon">
                <DiscordIcon />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[10.5px] font-semibold text-white/55 tracking-wide uppercase">Join us on</span>
                <span className="text-[13.5px] font-bold text-white">Discord</span>
              </span>
              <span className="material-symbols-outlined text-white/35 text-[17px] ml-auto group-hover:translate-x-0.5 transition-transform duration-200">
                arrow_forward
              </span>
            </a>

            {/* Reddit */}
            <a
              href="https://www.reddit.com/user/allsitehub/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-cta-btn social-cta-reddit group w-full sm:w-auto min-w-0 sm:min-w-[160px] touch-manipulation"
              aria-label="Follow us on Reddit"
            >
              <span className="social-cta-icon-wrap social-cta-reddit-icon">
                <RedditIcon />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[10.5px] font-semibold text-white/55 tracking-wide uppercase">Follow us on</span>
                <span className="text-[13.5px] font-bold text-white">Reddit</span>
              </span>
              <span className="material-symbols-outlined text-white/35 text-[17px] ml-auto group-hover:translate-x-0.5 transition-transform duration-200">
                arrow_forward
              </span>
            </a>
          </div>

          {/* Region pill */}
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-3.5 py-1.5 sm:py-2 text-[11.5px] sm:text-[12.5px] text-[var(--text-secondary)] max-w-full">
            <span className="text-sm sm:text-base leading-none shrink-0">{regionFlag}</span>
            <span className="w-px h-3 bg-white/15 shrink-0" />
            <span className="truncate">
              Showing <strong className="text-[var(--text-primary)] font-semibold">{activeRegion}</strong>
              <span className="mx-1 text-white/20">·</span>
              <strong className="text-blue-400 font-semibold">{filteredCount}</strong> sites
            </span>
          </div>
        </div>

        {/* Right — stats card */}
        <div className="glass-panel p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/10 relative overflow-hidden rim-light w-full">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <span className="text-[10.5px] sm:text-[11.5px] font-bold tracking-[0.1em] uppercase text-[var(--text-muted)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Platform Overview
            </span>
            <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              Live updates
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <StatBox label="Curated Sites" value={totalSites.toString()} sub="Hand-tested" />
            <StatBox label="Categories" value={totalCategories.toString()} sub="Streaming & Anime" />
            <StatBox label="Regions" value={totalRegions.toString()} sub="Worldwide coverage" />
            <StatBox
              label="All-Time Visitors"
              value={totalUsers.toLocaleString()}
              sub="Growing daily"
              glow
            />
          </div>

          <div className="bg-white/[0.03] rounded-xl p-3.5 sm:p-4 border border-white/5 flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-400 text-lg sm:text-xl shrink-0 mt-0.5">verified</span>
            <p className="text-[11.5px] sm:text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
              Every link is community-vetted, monitored for uptime, and verified for high streaming performance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBox({ label, value, sub, glow = false }: { label: string; value: string; sub: string; glow?: boolean }) {
  return (
    <div className={`bg-white/[0.03] rounded-xl p-3 sm:p-4 border border-white/5 ${glow ? 'relative overflow-hidden' : ''}`}>
      {glow && (
        <div className="absolute -top-6 -right-6 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
      )}
      <div className="font-headline font-extrabold text-xl sm:text-2xl text-[var(--text-primary)] mb-0.5 tracking-tight">
        {value}
      </div>
      <div className="text-[11px] sm:text-[12px] font-semibold text-[var(--text-secondary)] mb-0.5">{label}</div>
      <div className="text-[10px] text-[var(--text-muted)]">{sub}</div>
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.955 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.703zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}
