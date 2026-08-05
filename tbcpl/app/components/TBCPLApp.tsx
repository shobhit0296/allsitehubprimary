'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Site, Category } from '@/lib/data';
import { REGION_FLAGS, ONLINE_BASE, filterSites, getSitesByCategory } from '@/lib/data';
import Navbar from './Navbar';
import Hero from './Hero';
import Sidebar from './Sidebar';
import CategorySection from './CategorySection';

interface AllsitehubAppProps {
  sites: Site[];
  categories: Category[];
  regions: string[];
}

export default function AllsitehubApp({ sites, categories, regions }: AllsitehubAppProps) {
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState('US');
  const [activeCategory, setActiveCategory] = useState('all');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // ── Live online users — fluctuate ±8% every 20 s ──
  const [onlineCounts, setOnlineCounts] = useState<Record<string, number>>(ONLINE_BASE);
  useEffect(() => {
    const tick = () => {
      setOnlineCounts(() => {
        const next: Record<string, number> = {};
        for (const [r, base] of Object.entries(ONLINE_BASE)) {
          const jitter = 1 + (Math.random() - 0.5) * 0.16; // ±8%
          next[r] = Math.round(base * jitter);
        }
        return next;
      });
    };
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, []);

  const activeOnline = onlineCounts[activeRegion] ?? 0;
  const globalOnline = useMemo(() => Object.values(onlineCounts).reduce((a, b) => a + b, 0), [onlineCounts]);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const filteredSites = useMemo(
    () => filterSites(sites, search, activeRegion, activeCategory),
    [sites, search, activeRegion, activeCategory],
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
    () =>
      activeCategory === 'all'
        ? categories.filter(c => (grouped[c.name]?.length ?? 0) > 0)
        : categories.filter(c => c.name === activeCategory),
    [activeCategory, categories, grouped],
  );

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="noise-overlay" />
      <Navbar
        search={search}
        onSearchChange={setSearch}
        regions={regions}
        activeRegion={activeRegion}
        onRegionChange={setActiveRegion}
        onlineCount={activeOnline}
      />

      <Hero
        totalSites={sites.length}
        totalCategories={categories.length}
        totalRegions={regions.length}
        regionFlag={REGION_FLAGS[activeRegion] ?? '🌍'}
        activeRegion={activeRegion}
        filteredCount={filteredSites.length}
        onlineCount={globalOnline}
      />

      {/* Trending — sticky under navbar, mobile/tablet only */}
      <div className="xl:hidden sticky top-16 z-40 w-full bg-[#0c1324]/85 backdrop-blur-xl border-b border-white/5 mb-16">
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 w-full py-3.5">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Trending:</span>
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(activeCategory === cat.name ? 'all' : cat.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  activeCategory === cat.name
                    ? 'text-blue-400 border-blue-500/50 bg-blue-500/10'
                    : 'glass-lux text-[var(--text-secondary)] border-white/5 hover:text-blue-400'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Categories & Directory */}
      <section id="directory" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 w-full grid grid-cols-1 xl:grid-cols-12 gap-10 mb-16 scroll-mt-20">
        <div className="hidden xl:block xl:col-span-3">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
            <Sidebar
              categories={categories}
              categoryCounts={categoryCounts}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
        </div>

        <div className="xl:col-span-9">
          {/* Mobile: horizontal category scroll */}
          <div className="flex xl:hidden no-scrollbar gap-2 overflow-x-auto pb-1 mb-6">
            {[{ name: 'all', icon: '✦', label: 'All' }, ...categories.map(c => ({ name: c.name, icon: c.icon, label: c.name }))].map(item => (
              <button
                key={item.name}
                onClick={() => setActiveCategory(item.name)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  activeCategory === item.name
                    ? 'text-blue-400 border-blue-500/50 bg-blue-500/10'
                    : 'text-[var(--text-secondary)] border-white/10 glass-lux'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
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
            <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl mb-4">
                <span className="material-symbols-outlined text-[28px] text-blue-400">search_off</span>
              </div>
              <p className="text-[var(--text-secondary)] text-base mb-1">No sites found</p>
              <p className="text-[var(--text-muted)] text-sm mb-5">Try a different search or region</p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('all'); setActiveRegion('US'); }}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-semibold"
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

      {/* Mobile-only sidebar content (categories, discord) */}
      <section className="xl:hidden max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 w-full mb-16">
        <Sidebar
          categories={categories}
          categoryCounts={categoryCounts}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </section>

      {/* Footer */}
      <footer className="bg-transparent w-full py-16 border-t border-white/5 mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <span className="font-headline text-lg font-extrabold text-[var(--text-primary)] mb-4 inline-block">
              All<span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">site</span>hub
            </span>
            <p className="text-sm text-[var(--text-muted)] max-w-xs mb-6">
              Curated streaming directory for movies, anime, manga, live TV and sports. We do not host any content.
            </p>
            <a
              href="https://discord.gg/EDH5ScSsv"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl glass-lux border border-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-all inline-flex"
            >
              <DiscordIcon />
            </a>
          </div>
          <div>
            <h5 className="text-[11px] font-bold tracking-widest uppercase text-[var(--text-primary)] mb-4">Directory</h5>
            <ul className="space-y-3">
              <li><a href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Home</a></li>
              <li><a href="#directory" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Categories</a></li>
              <li><a href="/request" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Request Site</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[11px] font-bold tracking-widest uppercase text-[var(--text-primary)] mb-4">Legal</h5>
            <ul className="space-y-3">
              <li><a href="/about" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">About</a></li>
              <li><a href="/dmca" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">DMCA</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-[var(--text-muted)]">© {new Date().getFullYear()} Allsitehub. All rights reserved.</p>
          <span className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Systems Operational
          </span>
        </div>
      </footer>
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.955 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z"/>
    </svg>
  );
}
