'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { Site } from '@/lib/data';
import SiteCard from './SiteCard';
import NativeAdCard from './NativeAdCard';

interface Props {
  sites: Site[];
  category?: string;
  showAdCard?: boolean;
}

export default function CategorySiteGrid({ sites, category, showAdCard = true }: Props) {
  const [liveSites, setLiveSites] = useState<Site[]>(sites);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLiveSites(sites);
  }, [sites]);

  useEffect(() => {
    let mounted = true;
    async function sync() {
      try {
        const res = await fetch('/api/sites', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (mounted && Array.isArray(data.sites)) {
            const relevant = (category ? data.sites.filter((s: Site) => s.category === category) : data.sites)
              .sort((a: Site, b: Site) => (a.order ?? 0) - (b.order ?? 0));
            if (relevant.length > 0) setLiveSites(relevant);
          }
        }
      } catch {
        // fallback
      }
    }
    sync();
    const onFocus = () => sync();
    window.addEventListener('focus', onFocus);
    window.addEventListener('visibilitychange', onFocus);
    return () => {
      mounted = false;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('visibilitychange', onFocus);
    };
  }, [category]);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  if (liveSites.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)]">
        <p className="text-lg font-semibold">No sites in this category yet.</p>
        <p className="text-sm mt-2">Check back soon — we&apos;re always adding more.</p>
      </div>
    );
  }

  return (
    <div className="sites-grid">
      {liveSites.map((site, index) => (
        <React.Fragment key={site.id}>
          <SiteCard
            key={site.id}
            site={site}
            isBookmarked={bookmarks.has(site.id)}
            onToggleBookmark={toggleBookmark}
          />
          {showAdCard && index === 4 && <NativeAdCard />}
        </React.Fragment>
      ))}
    </div>
  );
}
