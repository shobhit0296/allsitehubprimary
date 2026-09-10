interface HeroProps {
  totalSites: number;
  totalCategories: number;
  totalRegions: number;
  regionFlag: string;
  activeRegion: string;
  filteredCount: number;
  totalUsers?: number;
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

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-center page-offset-search lg:page-offset pb-10 sm:pb-16 lg:pb-28">
        {/* Left — headline */}
        <div className="w-full min-w-0">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full glass-lux mb-4 sm:mb-6 border border-white/10 max-w-full">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
            <span className="text-[10px] sm:text-[11.5px] font-bold tracking-[0.08em] sm:tracking-[0.1em] uppercase text-[var(--text-accent)] truncate">
              Website Discovery Platform
            </span>
          </div>

          <h1 className="font-headline text-[1.9rem] xs:text-[2.2rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.15rem] font-extrabold mb-4 sm:mb-5 leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)]">
            Discover Websites.
            <br />
            <span className="gradient-text">Search Smarter.</span>
          </h1>

          <p className="text-[0.93rem] sm:text-[1.12rem] lg:text-[1.2rem] text-[var(--text-secondary)] mb-5 sm:mb-7 max-w-[560px] leading-[1.6]">
            AllSiteHub helps you discover useful websites across the internet. Search, explore and refine websites by category to quickly find the tools, resources and online platforms you&apos;re looking for.
          </p>

          {/* ── Community CTAs ── */}
          {/* Phone view: Matte-finish 3-column logo-only community section */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-5 w-full sm:hidden">
            {/* Discord */}
            <a
              href="https://discord.gg/ZEMSvP2HX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-12 rounded-2xl bg-[#0b0c12]/90 border border-white/[0.08] hover:border-[#5865F2]/45 hover:bg-[#5865F2]/10 active:scale-95 transition-all duration-200 touch-manipulation shadow-[0_2px_10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] group"
              aria-label="Discord Community"
              title="Discord"
            >
              <span className="w-8 h-8 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2] group-hover:scale-105 group-hover:bg-[#5865F2] group-hover:text-white transition-all duration-200">
                <DiscordIcon />
              </span>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/+gWOCVAqtcXxkZDk9"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-12 rounded-2xl bg-[#0b0c12]/90 border border-white/[0.08] hover:border-[#229ED9]/45 hover:bg-[#229ED9]/10 active:scale-95 transition-all duration-200 touch-manipulation shadow-[0_2px_10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] group"
              aria-label="Telegram Channel"
              title="Telegram"
            >
              <span className="w-8 h-8 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-center text-[#229ED9] group-hover:scale-105 group-hover:bg-[#229ED9] group-hover:text-white transition-all duration-200">
                <TelegramIcon />
              </span>
            </a>

            {/* Reddit */}
            <a
              href="https://www.reddit.com/user/allsitehub/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-12 rounded-2xl bg-[#0b0c12]/90 border border-white/[0.08] hover:border-[#FF4500]/45 hover:bg-[#FF4500]/10 active:scale-95 transition-all duration-200 touch-manipulation shadow-[0_2px_10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] group"
              aria-label="Reddit Community"
              title="Reddit"
            >
              <span className="w-8 h-8 rounded-xl bg-[#FF4500]/15 border border-[#FF4500]/30 flex items-center justify-center text-[#FF4500] group-hover:scale-105 group-hover:bg-[#FF4500] group-hover:text-white transition-all duration-200">
                <RedditIcon />
              </span>
            </a>
          </div>

          {/* Tablet/Desktop view (sm+): full inline CTA buttons */}
          <div className="hidden sm:flex flex-row flex-wrap gap-3 mb-6 sm:mb-8 w-full">
            {/* Discord */}
            <a
              href="https://discord.gg/ZEMSvP2HX"
              target="_blank"
              rel="noopener noreferrer"
              className="social-cta-btn social-cta-discord group w-auto min-w-[160px] touch-manipulation"
              aria-label="Join our Discord community"
            >
              <span className="social-cta-icon-wrap social-cta-discord-icon text-white">
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

            {/* Telegram */}
            <a
              href="https://t.me/+gWOCVAqtcXxkZDk9"
              target="_blank"
              rel="noopener noreferrer"
              className="social-cta-btn social-cta-telegram group w-auto min-w-[160px] touch-manipulation"
              aria-label="Join our Telegram group"
            >
              <span className="social-cta-icon-wrap social-cta-telegram-icon text-white">
                <TelegramIcon />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[10.5px] font-semibold text-white/55 tracking-wide uppercase">Join us on</span>
                <span className="text-[13.5px] font-bold text-white">Telegram</span>
              </span>
              <span className="material-symbols-outlined text-white/35 text-[17px] ml-auto group-hover:translate-x-0.5 transition-transform duration-200">
                arrow_forward
              </span>
            </a>

            {/* Reddit */}
            <a
              href="https://www.reddit.com/user/allsitehub/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
              target="_blank"
              rel="noopener noreferrer"
              className="social-cta-btn social-cta-reddit group w-auto min-w-[160px] touch-manipulation"
              aria-label="Follow us on Reddit"
            >
              <span className="social-cta-icon-wrap social-cta-reddit-icon text-white">
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
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5 text-[11px] sm:text-[12.5px] text-[var(--text-secondary)] max-w-full">
            <span className="text-sm sm:text-base leading-none shrink-0">{regionFlag}</span>
            <span className="w-px h-3 bg-white/15 shrink-0" />
            <span className="truncate">
              Showing <strong className="text-[var(--text-primary)] font-semibold">{activeRegion}</strong>
              <span className="mx-1 text-white/20">·</span>
              <strong className="text-blue-400 font-semibold">{filteredCount}</strong> sites
            </span>
          </div>
        </div>

        {/* Right — floating stat cards */}
        <div className="relative w-full max-w-[360px] xs:max-w-sm sm:max-w-2xl lg:max-w-none mx-auto mt-0 lg:mt-0">
          <div className="absolute inset-0 bg-blue-500/5 rounded-[36px] sm:rounded-[48px] rotate-2 blur-2xl pointer-events-none" />
          <div className="relative flex items-center justify-center p-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3 w-full max-w-[360px] xs:max-w-sm sm:max-w-2xl lg:max-w-md animate-float-lux">
              {/* Card 1 — Total Sites */}
              <div className="glass-lux p-3 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-white/10 card-hover-lux flex flex-col justify-between">
                <div className="w-7 sm:w-9 h-7 sm:h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center mb-2 sm:mb-4 shrink-0">
                  <span className="material-symbols-outlined text-blue-400 text-[16px] sm:text-[20px]">trending_up</span>
                </div>
                <div>
                  <div className="font-headline text-lg sm:text-3xl md:text-4xl font-extrabold mb-0.5 sm:mb-1 text-[var(--text-primary)] tracking-tight">
                    {totalSites}+
                  </div>
                  <div className="text-[9px] sm:text-[11px] font-bold tracking-[0.06em] sm:tracking-[0.1em] uppercase text-[var(--text-muted)] truncate">
                    Total Sites
                  </div>
                </div>
              </div>

              {/* Card 2 — Categories */}
              <div className="glass-lux-bright p-3 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-violet-500/25 sm:translate-y-3 md:translate-y-4 card-hover-lux flex flex-col justify-between">
                <div className="w-7 sm:w-9 h-7 sm:h-9 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center mb-2 sm:mb-4 shrink-0">
                  <span className="material-symbols-outlined text-violet-400 text-[16px] sm:text-[20px]">category</span>
                </div>
                <div>
                  <div className="font-headline text-lg sm:text-3xl md:text-4xl font-extrabold mb-0.5 sm:mb-1 text-[var(--text-primary)] tracking-tight">
                    {totalCategories}
                  </div>
                  <div className="text-[9px] sm:text-[11px] font-bold tracking-[0.06em] sm:tracking-[0.1em] uppercase text-[var(--text-muted)] truncate">
                    Categories
                  </div>
                </div>
              </div>

              {/* Card 3 — Regions */}
              <div className="glass-lux-bright p-3 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-white/10 sm:-translate-y-2 card-hover-lux flex flex-col justify-between">
                <div className="w-7 sm:w-9 h-7 sm:h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center mb-2 sm:mb-4 shrink-0">
                  <span className="material-symbols-outlined text-cyan-400 text-[16px] sm:text-[20px]">language</span>
                </div>
                <div>
                  <div className="font-headline text-lg sm:text-3xl md:text-4xl font-extrabold mb-0.5 sm:mb-1 text-[var(--text-primary)] tracking-tight">
                    {totalRegions}
                  </div>
                  <div className="text-[9px] sm:text-[11px] font-bold tracking-[0.06em] sm:tracking-[0.1em] uppercase text-[var(--text-muted)] truncate">
                    Regions
                  </div>
                </div>
              </div>

              {/* Card 4 — Active Users Till Now */}
              <div className="glass-lux p-3 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-white/10 sm:translate-y-1 md:translate-y-2 card-hover-lux flex flex-col justify-between">
                <div className="w-7 sm:w-9 h-7 sm:h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-2 sm:mb-4 shrink-0">
                  <span className="material-symbols-outlined text-emerald-400 text-[16px] sm:text-[20px]">groups</span>
                </div>
                <div>
                  <div
                    className="font-headline text-lg sm:text-3xl md:text-4xl font-extrabold mb-0.5 sm:mb-1 text-[var(--text-primary)] tracking-tight"
                    suppressHydrationWarning
                  >
                    {totalUsers.toLocaleString()}+
                  </div>
                  <div className="text-[9px] sm:text-[11px] font-bold tracking-[0.06em] sm:tracking-[0.1em] uppercase text-[var(--text-muted)] truncate">
                    Active Users
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.955 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.894-1.232 5.344-1.782 7.74-.233 1.014-.607 1.353-.969 1.386-.787.072-1.385-.52-2.148-1.02-.194-.128-1.89-1.225-2.073-1.378-.507-.423-.083-.655.124-.87.054-.057 2.47-2.395 2.518-2.6.006-.026.012-.123-.047-.176s-.138-.035-.198-.021c-.084.02-1.428.908-4.032 2.668-.381.263-.727.391-1.036.384-.34-.007-.996-.192-1.484-.351-.598-.194-1.074-.297-1.033-.626.022-.172.26-.348.716-.53 2.798-1.218 4.664-2.022 5.597-2.411 2.662-1.109 3.216-1.301 3.577-1.307.079-.001.257.018.372.112.097.079.124.186.134.263.01.078.02.257.01.37z" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.82 14.15c.036.244.055.492.055.744 0 3.019-3.517 5.47-7.856 5.47-4.34 0-7.857-2.451-7.857-5.47 0-.252.02-.5.055-.744-.542-.246-.92-.79-.92-1.424 0-.86.698-1.558 1.558-1.558.42 0 .8.166 1.08.437 1.062-.766 2.53-1.253 4.16-1.31l.848-3.99a.32.32 0 0 1 .38-.246l2.813.598a1.076 1.076 0 1 1-.086.512l-2.518-.535-.756 3.556c1.61.065 3.056.552 4.11 1.31.28-.27.66-.437 1.08-.437.86 0 1.558.698 1.558 1.558 0 .636-.38 1.183-.926 1.428zM8.16 14.06c-.68 0-1.24-.55-1.24-1.235 0-.686.56-1.246 1.24-1.246.686 0 1.245.56 1.245 1.246 0 .686-.56 1.235-1.245 1.235zm7.68 0c-.68 0-1.24-.55-1.24-1.235 0-.686.56-1.246 1.24-1.246.686 0 1.245.56 1.245 1.246 0 .686-.56 1.235-1.245 1.235zm-6.1 2.02c-.15-.15-.15-.393 0-.543a.386.386 0 0 1 .543 0c.686.686 2.033.75 2.42.75.386 0 1.75-.064 2.42-.75a.386.386 0 0 1 .543 0c.15.15.15.393 0 .543-.75.75-2.11.943-2.963.943-.85 0-2.21-.193-2.963-.943z" />
    </svg>
  );
}
