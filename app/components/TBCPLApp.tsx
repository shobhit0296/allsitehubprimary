'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Site, Category } from '@/lib/data';
import { REGION_FLAGS, filterSites, getSitesByCategory } from '@/lib/data';
import Navbar from './Navbar';
import Hero from './Hero';
import Sidebar from './Sidebar';
import CategorySection from './CategorySection';

import { useLiveOnlineCounter } from '@/lib/useLiveOnlineCounter';
import { calculateAllTimeActiveUsers } from '@/lib/activeUsers';

/** Converts category name to the section id used by CategorySection */
const catSlug = (name: string) =>
  `cat-${name.replace(/\s+/g, '-').replace(/&/g, 'and').toLowerCase()}`;

interface AllsitehubAppProps {
  sites: Site[];
  categories: Category[];
  regions: string[];
}

export default function AllsitehubApp({ sites, categories, regions }: AllsitehubAppProps) {
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState('US');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name ?? 'Movies & Shows');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // ── Scheduled time-of-day live online users (changes every 15-20s) ──
  const liveOnlineCount = useLiveOnlineCounter();

  // ── All-time total users / visitors (GA4 Property 546801810 with daily ~25k growth) ──
  const [totalUsers, setTotalUsers] = useState<number>(() => calculateAllTimeActiveUsers());

  useEffect(() => {
    fetch('/api/stats/visitors')
      .then(res => res.json())
      .then(data => {
        if (data.totalUsers) setTotalUsers(data.totalUsers);
      })
      .catch(() => {});

    // Increment visitor count once per session
    if (!sessionStorage.getItem('ash_visited')) {
      sessionStorage.setItem('ash_visited', '1');
      fetch('/api/stats/visitors', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.totalUsers) setTotalUsers(data.totalUsers);
        })
        .catch(() => {});
    }
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const filteredSites = useMemo(
    () => filterSites(sites, search, activeRegion, 'all'),
    [sites, search, activeRegion],
  );

  const categoryCounts = useMemo(() => {
    const base = filterSites(sites, '', activeRegion, 'all');
    return categories.reduce((acc, cat) => {
      acc[cat.name] = base.filter(s => s.category === cat.name).length;
      return acc;
    }, {} as Record<string, number>);
  }, [sites, activeRegion, categories]);

  const grouped = useMemo(() => getSitesByCategory(filteredSites), [filteredSites]);

  const visibleCategories = useMemo(
    () => categories.filter(c => (grouped[c.name]?.length ?? 0) > 0),
    [categories, grouped],
  );

  // ── Scroll spy — highlight sidebar category as sections scroll into view ──
  const scrollSpyActive = useRef(true);
  const activeCategoryRef = useRef(activeCategory);
  activeCategoryRef.current = activeCategory;

  useEffect(() => {
    const sections = categories
      .map(c => document.getElementById(catSlug(c.name)))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    let rafId: number | null = null;

    const observer = new IntersectionObserver(
      entries => {
        if (!scrollSpyActive.current) return;
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
          // Find the topmost intersecting section
          const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

          if (visible.length > 0) {
            const id = visible[0].target.id;
            const matched = categories.find(c => catSlug(c.name) === id);
            // ONLY update state if the category actually changed!
            if (matched && matched.name !== activeCategoryRef.current) {
              setActiveCategory(matched.name);
            }
          }
        });
      },
      { rootMargin: '-15% 0px -50% 0px', threshold: 0.1 },
    );

    sections.forEach(s => observer.observe(s));
    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [categories]);

  // ── Auto-scroll active chip into view inside mobile category bar ──
  const mobileCatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileCatContainerRef.current) return;
    const container = mobileCatContainerRef.current;
    const activeEl = container.querySelector('.chip-active') as HTMLElement | null;
    if (activeEl) {
      const elLeft = activeEl.offsetLeft;
      const elWidth = activeEl.offsetWidth;
      const contScrollLeft = container.scrollLeft;
      const contWidth = container.clientWidth;

      // Only scroll horizontally if the active chip is outside the visible viewport
      if (elLeft < contScrollLeft + 20 || elLeft + elWidth > contScrollLeft + contWidth - 20) {
        container.scrollTo({
          left: Math.max(0, elLeft - contWidth / 2 + elWidth / 2),
          behavior: 'smooth',
        });
      }
    }
  }, [activeCategory]);

  // ── Floating Back to Top Button ──
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowBackToTop(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When user manually picks a category, native smooth scroll into view
  const handleCategoryChange = useCallback((cat: string) => {
    scrollSpyActive.current = false;
    setActiveCategory(cat);

    const el = document.getElementById(catSlug(cat));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Re-enable scroll spy after smooth scroll finishes
    setTimeout(() => {
      scrollSpyActive.current = true;
    }, 800);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="noise-overlay" />
      <Navbar
        search={search}
        onSearchChange={setSearch}
        regions={regions}
        activeRegion={activeRegion}
        onRegionChange={setActiveRegion}
        onlineCount={liveOnlineCount}
      />

      <Hero
        totalSites={sites.length}
        totalCategories={categories.length}
        totalRegions={regions.length}
        regionFlag={REGION_FLAGS[activeRegion] ?? '🌍'}
        activeRegion={activeRegion}
        filteredCount={filteredSites.length}
        totalUsers={totalUsers}
      />
      {/* Directory Content Section */}
      <section
        id="directory"
        className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 mb-16 sm:mb-20 scroll-mt-24"
      >
        {/* Sticky Desktop Left Category Sidebar */}
        <aside
          className="hidden lg:block lg:col-span-4 xl:col-span-3 self-start sticky top-[84px] z-30"
          style={{ position: 'sticky', top: '84px', alignSelf: 'flex-start' }}
        >
          <div className="max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar pr-1">
            <Sidebar
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              categoryCounts={categoryCounts}
            />
          </div>
        </aside>

        <div className="lg:col-span-8 xl:col-span-9 min-w-0 w-full">
          {/* Mobile only (< lg): sticky horizontal category scroll */}
          <div
            ref={mobileCatContainerRef}
            className="flex lg:hidden sticky top-[64px] z-20 bg-[var(--bg-base)]/92 backdrop-blur-md py-2.5 -mx-2 px-3 no-scrollbar gap-2 overflow-x-auto mb-6 sm:mb-8 scroll-smooth overscroll-x-contain border-b border-[var(--border)] touch-pan-x"
            style={{ WebkitOverflowScrolling: 'touch', position: 'sticky', top: '64px' }}
          >
            {categories.map(c => (
              <button
                key={c.name}
                onClick={() => handleCategoryChange(c.name)}
                className={`chip shrink-0 select-none touch-manipulation transition-all duration-200 active:scale-95 ${
                  activeCategory === c.name ? 'chip-active' : ''
                }`}
              >
                <span className="text-sm leading-none">{c.icon}</span>
                <span className="font-semibold text-xs sm:text-[13px]">{c.name}</span>
                {categoryCounts[c.name] !== undefined && (
                  <span className="text-[10px] opacity-75 ml-0.5 font-mono">({categoryCounts[c.name]})</span>
                )}
              </button>
            ))}
          </div>

          {search && (
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              <strong className="text-blue-400">{filteredSites.length}</strong> result{filteredSites.length !== 1 ? 's' : ''} for{' '}
              <strong className="text-[var(--text-primary)]">&ldquo;{search}&rdquo;</strong>
            </p>
          )}

          {visibleCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl mb-5">
                <span className="material-symbols-outlined text-[28px] text-blue-400">search_off</span>
              </div>
              <p className="font-headline text-base font-bold text-[var(--text-primary)] mb-1.5">No sites found</p>
              <p className="text-[var(--text-muted)] text-sm mb-6">Try a different search or region</p>
              <button
                onClick={() => { setSearch(''); setActiveRegion('US'); }}
                className="btn-brand rounded-full px-6 py-2.5 text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            visibleCategories.map(cat => (
              <CategorySection
                key={cat.name}
                category={cat}
                sites={grouped[cat.name] ?? []}
                bookmarks={bookmarks}
                onToggleBookmark={toggleBookmark}
              />
            ))
          )}

        </div>
      </section>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full glass-lux border border-white/20 text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 hover:border-[var(--primary)] hover:shadow-[0_0_20px_var(--glow)] touch-manipulation animate-fade-in cursor-pointer"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        >
          <span className="material-symbols-outlined text-[20px] sm:text-[22px]">arrow_upward</span>
        </button>
      )}

      {/* Footer */}
      <footer className="bg-transparent w-full py-16 sm:py-20 border-t border-white/[0.06] mt-auto">
        <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2">
            <span className="font-headline text-xl font-extrabold tracking-[-0.02em] text-[var(--text-primary)] mb-5 inline-block">
              All<span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">site</span>hub
            </span>
            <p className="text-[13.5px] text-[var(--text-muted)] max-w-[280px] mb-6 leading-relaxed">
              Curated streaming directory for movies, anime, manga, live TV and sports. We do not host any content.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://discord.gg/ZEMSvP2HX"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord Server"
                className="w-10 h-10 rounded-xl glass-lux border border-white/[0.07] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:border-[#5865F2]/50 hover:bg-[#5865F2]/20 transition-all inline-flex"
              >
                <DiscordIcon />
              </a>
              <a
                href="https://t.me/+gWOCVAqtcXxkZDk9"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram Group"
                className="w-10 h-10 rounded-xl glass-lux border border-white/[0.07] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:border-[#229ED9]/50 hover:bg-[#229ED9]/20 transition-all inline-flex"
              >
                <TelegramIcon />
              </a>
              <a
                href="https://www.reddit.com/user/allsitehub/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Reddit Community"
                className="w-10 h-10 rounded-xl glass-lux border border-white/[0.07] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:border-[#FF4500]/50 hover:bg-[#FF4500]/20 transition-all inline-flex"
              >
                <RedditIcon />
              </a>
            </div>
          </div>
          <div>
            <h5 className="text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--text-secondary)] mb-5">Directory</h5>
            <ul className="space-y-3.5">
              <li><a href="/" className="text-[13.5px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Home</a></li>
              <li><a href="#directory" className="text-[13.5px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Categories</a></li>
              <li><a href="/request" className="text-[13.5px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Request Site</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--text-secondary)] mb-5">Legal</h5>
            <ul className="space-y-3.5">
              <li><a href="/about" className="text-[13.5px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">About</a></li>
              <li><a href="/dmca" className="text-[13.5px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">DMCA</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 mt-14 pt-7 border-t border-white/[0.05] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-[var(--text-muted)]">© {new Date().getFullYear()} Allsitehub. All rights reserved.</p>
          <span className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
            <span className="pulse-dot w-2 h-2 rounded-full bg-emerald-500" /> Systems Operational
          </span>
        </div>
      </footer>
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.078.078 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.955 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.894-1.232 5.344-1.782 7.74-.233 1.014-.607 1.353-.969 1.386-.787.072-1.385-.52-2.148-1.02-.194-.128-1.89-1.225-2.073-1.378-.507-.423-.083-.655.124-.87.054-.057 2.47-2.395 2.518-2.6.006-.026.012-.123-.047-.176s-.138-.035-.198-.021c-.084.02-1.428.908-4.032 2.668-.381.263-.727.391-1.036.384-.34-.007-.996-.192-1.484-.351-.598-.194-1.074-.297-1.033-.626.022-.172.26-.348.716-.53 2.798-1.218 4.664-2.022 5.597-2.411 2.662-1.109 3.216-1.301 3.577-1.307.079-.001.257.018.372.112.097.079.124.186.134.263.01.078.02.257.01.37z"/>
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.82 14.15c.036.244.055.492.055.744 0 3.019-3.517 5.47-7.856 5.47-4.34 0-7.857-2.451-7.857-5.47 0-.252.02-.5.055-.744-.542-.246-.92-.79-.92-1.424 0-.86.698-1.558 1.558-1.558.42 0 .8.166 1.08.437 1.062-.766 2.53-1.253 4.16-1.31l.848-3.99a.32.32 0 0 1 .38-.246l2.813.598a1.076 1.076 0 1 1-.086.512l-2.518-.535-.756 3.556c1.61.065 3.056.552 4.11 1.31.28-.27.66-.437 1.08-.437.86 0 1.558.698 1.558 1.558 0 .636-.38 1.183-.926 1.428zM8.16 14.06c-.68 0-1.24-.55-1.24-1.235 0-.686.56-1.246 1.24-1.246.686 0 1.245.56 1.245 1.246 0 .686-.56 1.235-1.245 1.235zm7.68 0c-.68 0-1.24-.55-1.24-1.235 0-.686.56-1.246 1.24-1.246.686 0 1.245.56 1.245 1.246 0 .686-.56 1.235-1.245 1.235zm-6.1 2.02c-.15-.15-.15-.393 0-.543a.386.386 0 0 1 .543 0c.686.686 2.033.75 2.42.75.386 0 1.75-.064 2.42-.75a.386.386 0 0 1 .543 0c.15.15.15.393 0 .543-.75.75-2.11.943-2.963.943-.85 0-2.21-.193-2.963-.943z"/>
    </svg>
  );
}
