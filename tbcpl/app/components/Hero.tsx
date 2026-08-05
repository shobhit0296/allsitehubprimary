interface HeroProps {
  totalSites: number;
  totalCategories: number;
  totalRegions: number;
  regionFlag: string;
  activeRegion: string;
  filteredCount: number;
  onlineCount: number;
}

export default function Hero({ totalSites, totalCategories, totalRegions, regionFlag, activeRegion, filteredCount, onlineCount }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background decor */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] bg-violet-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-grid-lux opacity-20" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center pt-28 pb-16 lg:pt-32 lg:pb-20">
        {/* Left — headline */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-lux mb-6 border border-white/10">
            <span className="pulse-dot w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-blue-400">Live Streaming Directory</span>
          </div>

          <h1 className="font-headline text-4xl sm:text-5xl font-bold mb-5 leading-[1.1] tracking-tight text-[var(--text-primary)]">
            Discover the Best <br />
            <span className="gradient-text">Streaming Sites</span> <br />
            Worldwide
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] mb-8 max-w-lg leading-relaxed">
            Curated streaming sites — movies, anime, manga, live TV and sports.
            Instant search with multi-region support, verified and community-checked.
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <a
              href="#directory"
              className="px-7 py-3.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl font-headline font-bold text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              Browse Sites
            </a>
            <a
              href="#directory"
              className="px-7 py-3.5 glass-lux border border-white/10 rounded-xl font-headline font-bold text-[var(--text-primary)] hover:bg-white/5 hover:scale-105 active:scale-95 transition-all"
            >
              Explore Categories
            </a>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-[var(--text-secondary)]">
            <span className="text-sm">{regionFlag}</span>
            <span>
              Showing <strong className="text-[var(--text-primary)] font-semibold">{activeRegion}</strong> ·{' '}
              <strong className="text-blue-400">{filteredCount}</strong> sites
            </span>
          </div>
        </div>

        {/* Right — floating stat cards */}
        <div className="relative h-[340px] sm:h-[420px]">
          <div className="absolute inset-0 bg-blue-500/5 rounded-[40px] rotate-3 blur-3xl" />
          <div className="relative h-full flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 w-full max-w-md animate-float-lux">
              <div className="glass-lux p-6 rounded-3xl border border-white/10 card-hover-lux">
                <span className="material-symbols-outlined text-blue-400 mb-2 block">trending_up</span>
                <div className="font-headline text-2xl sm:text-3xl font-bold mb-1 text-[var(--text-primary)]">{totalSites}+</div>
                <div className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Total Sites</div>
              </div>
              <div className="glass-lux-bright p-6 rounded-3xl border border-violet-500/30 translate-y-8 card-hover-lux">
                <span className="material-symbols-outlined text-violet-400 mb-2 block">category</span>
                <div className="font-headline text-2xl sm:text-3xl font-bold mb-1 text-[var(--text-primary)]">{totalCategories}</div>
                <div className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Categories</div>
              </div>
              <div className="glass-lux-bright p-6 rounded-3xl border border-white/10 -translate-y-4 card-hover-lux">
                <span className="material-symbols-outlined text-blue-400 mb-2 block">language</span>
                <div className="font-headline text-2xl sm:text-3xl font-bold mb-1 text-[var(--text-primary)]">{totalRegions}</div>
                <div className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Regions</div>
              </div>
              <div className="glass-lux p-6 rounded-3xl border border-white/10 translate-y-4 card-hover-lux">
                <span className="material-symbols-outlined text-violet-400 mb-2 block">person_pin</span>
                <div className="font-headline text-2xl sm:text-3xl font-bold mb-1 text-[var(--text-primary)]">{onlineCount.toLocaleString()}</div>
                <div className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Live Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
