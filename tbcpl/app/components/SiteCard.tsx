'use client';

import { useState } from 'react';
import type { Site } from '@/lib/data';

interface SiteCardProps {
  site: Site;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

const TAG_MAP: Record<string, { label: string; cls: string }> = {
  trusted:  { label: 'Trusted',  cls: 'tag tag-trusted' },
  featured: { label: 'Featured', cls: 'tag tag-featured' },
  new:      { label: 'New',      cls: 'tag tag-new' },
};

const FAVICON_BG = [
  'bg-blue-500/15', 'bg-violet-500/15', 'bg-emerald-500/15',
  'bg-amber-500/15', 'bg-rose-500/15', 'bg-cyan-500/15',
];
function faviconBg(name: string): string {
  return FAVICON_BG[name.charCodeAt(0) % FAVICON_BG.length];
}

export default function SiteCard({ site, isBookmarked, onToggleBookmark }: SiteCardProps) {
  const [imgError, setImgError] = useState(false);

  const faviconSrc = site.faviconUrl?.trim()
    ? site.faviconUrl.trim()
    : `https://www.google.com/s2/favicons?domain=${site.domain}&sz=64`;
  const priorityTag = site.tags.find(t => TAG_MAP[t]);
  const tag = priorityTag ? TAG_MAP[priorityTag] : null;

  const openSite = () => window.open(site.url, '_blank', 'noopener,noreferrer');

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Visit ${site.name}`}
      onClick={openSite}
      onKeyDown={e => e.key === 'Enter' && openSite()}
      className="group relative glass-lux p-4 rounded-2xl border border-white/10 card-hover-lux cursor-pointer outline-none flex items-start gap-3.5"
    >
      <div className={`w-14 h-14 rounded-2xl ${faviconBg(site.name)} border border-white/10 flex items-center justify-center overflow-hidden shrink-0 transition-transform group-hover:scale-105`}>
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={faviconSrc}
            alt={site.name}
            width={30}
            height={30}
            onError={() => setImgError(true)}
            className="object-contain"
          />
        ) : (
          <span className="font-headline font-extrabold text-xl gradient-text">{site.name[0]}</span>
        )}
      </div>

      <div className="min-w-0 flex-1 pr-6">
        <div className="flex items-center gap-1.5 mb-1">
          <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{site.name}</h4>
          {tag && <span className={tag.cls}>{tag.label}</span>}
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-snug line-clamp-2 mb-2">{site.description}</p>
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="truncate">{site.domain}</span>
        </div>
      </div>

      <button
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        className="bookmark-btn absolute top-3.5 right-3.5 p-1 leading-none shrink-0"
        onClick={e => { e.stopPropagation(); onToggleBookmark(site.id); }}
        style={{
          color: isBookmarked ? 'var(--yellow)' : 'var(--text-muted)',
          opacity: isBookmarked ? 1 : undefined,
        }}
      >
        <span className="material-symbols-outlined text-[19px] opacity-0 group-hover:opacity-100 transition-opacity" style={isBookmarked ? { opacity: 1, fontVariationSettings: "'FILL' 1" } : undefined}>
          {isBookmarked ? 'star' : 'star_border'}
        </span>
      </button>
    </div>
  );
}
