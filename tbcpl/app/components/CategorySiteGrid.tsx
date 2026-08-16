'use client';

import { useState, useCallback } from 'react';
import type { Site } from '@/lib/data';
import SiteCard from './SiteCard';

interface Props {
  sites: Site[];
}

export default function CategorySiteGrid({ sites }: Props) {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  if (sites.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)]">
        <p className="text-lg font-semibold">No sites in this category yet.</p>
        <p className="text-sm mt-2">Check back soon — we&apos;re always adding more.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-4.5 w-full">
      {sites.map(site => (
        <SiteCard
          key={site.id}
          site={site}
          isBookmarked={bookmarks.has(site.id)}
          onToggleBookmark={toggleBookmark}
        />
      ))}
    </div>
  );
}
