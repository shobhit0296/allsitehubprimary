'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Site, Category } from '@/lib/data';
import { REGION_FLAGS, filterSites, getSitesByCategory } from '@/lib/data';
import Navbar from './Navbar';
import Hero from './Hero';
import Sidebar from './Sidebar';
import CategorySection from './CategorySection';
import AdSenseBanner from './AdSenseBanner';

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
  const [liveSites, setLiveSites] = useState<Site[]>(sites);
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState('US');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name ?? 'Movies & Shows');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // Keep local state in sync when server props revalidate
  useEffect(() => {
    setLiveSites(sites);
  }, [sites]);

  // Background sync from /api/sites so admin edits reflect immediately without hard-refresh
  useEffect(() => {
    let mounted = true;
    async function syncSites() {
      try {
        const res = await fetch('/api/sites', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (mounted && Array.isArray(data.sites) && data.sites.length > 0) {
            setLiveSites(data.sites);
          }
        }
      } catch {
        // keep fallback SSR sites
      }
    }
    syncSites();

    // Instant update when switching tabs back to the site after editing in admin panel
    const onFocus = () => syncSites();
    window.addEventListener('focus', onFocus);
    window.addEventListener('visibilitychange', onFocus);

    return () => {
      mounted = false;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  // ── Scheduled time-of-day live online users (changes every 15-20s) ──
  const liveOnlineCount = useLiveOnlineCounter();

  // ── All-time total users / visitors — purely client-side, zero serverless calls ──
  // calculateAllTimeActiveUsers() computes the counter from elapsed time since anchor date.
  // No POST/GET to any backend, so Vercel free-tier quota is never drained.
  const [totalUsers, setTotalUsers] = useState<number>(() => calculateAllTimeActiveUsers());

  useEffect(() => {
    // Update counter once per minute so it ticks forward smoothly
    const interval = setInterval(() => {
      setTotalUsers(calculateAllTimeActiveUsers());
    }, 60_000);

    // Read ?q= search param from URL
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) setSearch(q);
    } catch {
      // ignore
    }

    return () => clearInterval(interval);
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const filteredSites = useMemo(
    () => filterSites(liveSites, search, activeRegion, 'all'),
    [liveSites, search, activeRegion],
  );

  const categoryCounts = useMemo(() => {
    const base = filterSites(liveSites, '', activeRegion, 'all');
    return categories.reduce((acc, cat) => {
      acc[cat.name] = base.filter(s => s.category === cat.name).length;
      return acc;
    }, {} as Record<string, number>);
  }, [liveSites, activeRegion, categories]);

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
      {/* ── Fixed Position AdSense Banner — between Hero and Directory ── */}
      <AdSenseBanner client="ca-pub-1348117799300846" />
      {/* Directory Content Section */}

      <section
        id="directory"
        className="max-w-[1740px] mx-auto px-3 sm:px-5 md:px-6 lg:px-5 xl:px-6 w-full grid grid-cols-1 lg:grid-cols-[225px_1fr] xl:grid-cols-[245px_1fr] gap-5 lg:gap-6 xl:gap-7 mb-12 sm:mb-16 scroll-mt-20"
      >
        {/* Sticky Desktop Left Category Sidebar */}
        <aside
          className="hidden lg:block w-full self-start sticky top-[84px] z-30"
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

        <div className="min-w-0 w-full">
          {/* Mobile only (< lg): sticky horizontal category scroll */}
          <div
            ref={mobileCatContainerRef}
            className="flex lg:hidden sticky z-20 bg-[var(--bg-base)]/95 backdrop-blur-xl py-2 -mx-3 sm:-mx-5 px-3 sm:px-5 no-scrollbar gap-1.5 sm:gap-2 overflow-x-auto mb-5 sm:mb-7 scroll-smooth overscroll-x-contain border-b border-[var(--border)] touch-pan-x shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
            style={{
              WebkitOverflowScrolling: 'touch',
              position: 'sticky',
              top: 'var(--nav-h)',
            }}
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
          className="fixed bottom-6 right-4 sm:right-6 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-lux border border-white/20 text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 hover:border-[var(--primary)] hover:shadow-[0_0_20px_var(--glow)] touch-manipulation animate-fade-in cursor-pointer"
          style={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <span className="material-symbols-outlined text-[19px] sm:text-[21px]">arrow_upward</span>
        </button>
      )}

      {/* ── Compact 2-3 line footer with separator line ── */}
      <footer className="w-full mt-14 sm:mt-20 border-t border-white/[0.08] pt-8 pb-12">
        <div className="max-w-[1740px] mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-3">
          {/* Line 1: Quick Links */}
          <nav aria-label="Quick links" className="flex items-center justify-center flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium text-[#9ca3af]">
            <Link href="/about" prefetch={false} className="hover:text-white transition-colors">About</Link>
            <span className="text-[#3f3f46]">·</span>
            <Link href="/request" prefetch={false} className="hover:text-white transition-colors">Request</Link>
            <span className="text-[#3f3f46]">·</span>
            <Link href="/dmca" prefetch={false} className="hover:text-white transition-colors">DMCA</Link>
            <span className="text-[#3f3f46]">·</span>
            <Link href="/privacy" prefetch={false} className="hover:text-white transition-colors">Privacy</Link>
            <span className="text-[#3f3f46]">·</span>
            <Link href="/terms" prefetch={false} className="hover:text-white transition-colors">Terms</Link>
            <span className="text-[#3f3f46]">·</span>
            <Link href="/recent" prefetch={false} className="hover:text-white transition-colors">Recent</Link>
            <span className="text-[#3f3f46]">·</span>
            <Link href="/collections" prefetch={false} className="hover:text-white transition-colors">Collections</Link>
          </nav>

          {/* Line 2: Disclaimer & Copyright */}
          <p className="text-[12px] text-[#71717a] max-w-xl leading-relaxed">
            © {new Date().getFullYear()} <span className="text-blue-400 font-semibold">AllSiteHub</span> (allsite) · Curated streaming &amp; web directory. We do not host any media files.
          </p>

          {/* Line 3: System Operational status */}
          <div className="flex items-center justify-center gap-2 text-[11.5px] text-[#52525b]">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
