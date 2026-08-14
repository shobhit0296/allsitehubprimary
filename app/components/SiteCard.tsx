'use client';

import type { Site } from '@/lib/data';
import SiteIcon from './SiteIcon';

interface SiteCardProps {
  site: Site;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

const TAG_MAP: Record<string, { label: string; cls: string }> = {
  trusted:  { label: 'TRUSTED',  cls: 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40' },
  featured: { label: 'FEATURED', cls: 'bg-amber-600/30 text-amber-300 border-amber-500/40' },
  new:      { label: 'NEW',      cls: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40' },
};

export default function SiteCard({ site, isBookmarked, onToggleBookmark }: SiteCardProps) {
  const priorityTag = site.tags?.find(t => TAG_MAP[t]);
  const tag = priorityTag ? TAG_MAP[priorityTag] : null;

  const openSite = () => window.open(site.url, '_blank', 'noopener,noreferrer');

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={site.name}
      onClick={openSite}
      onKeyDown={e => e.key === 'Enter' && openSite()}
      className="group relative rounded-2xl border border-white/[0.08] hover:border-white/[0.22] hover:bg-[#14192d]/90 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] w-full min-w-0 overflow-hidden px-3 py-2.5 sm:px-3.5 sm:py-3 h-[115px] sm:h-[128px] flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)]"
      style={{
        background: 'linear-gradient(180deg, rgba(20, 25, 42, 0.85) 0%, rgba(12, 15, 26, 0.95) 100%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* ── Top Row: Tag (Left) + Bookmark Star (Right) ── */}
      <div className="flex items-center justify-between w-full min-h-[20px] pointer-events-none">
        {tag ? (
          <span
            className={`text-[8px] sm:text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full border shadow-sm ${tag.cls}`}
          >
            {tag.label}
          </span>
        ) : (
          <span className="w-2" />
        )}

        {/* Bookmark star button */}
        <button
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          className="bookmark-btn pointer-events-auto p-1 leading-none shrink-0 rounded-lg hover:bg-white/[0.1] text-gray-400 hover:text-amber-400 transition-all duration-150 -mr-1 -mt-0.5"
          onClick={e => {
            e.stopPropagation();
            onToggleBookmark(site.id);
          }}
          style={{ color: isBookmarked ? '#f59e0b' : undefined }}
        >
          <span
            className={`material-symbols-outlined text-[17px] sm:text-[19px] transition-all ${
              isBookmarked
                ? 'opacity-100 text-amber-400'
                : 'opacity-40 sm:opacity-20 group-hover:opacity-90'
            }`}
            style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {isBookmarked ? 'star' : 'star_border'}
          </span>
        </button>
      </div>

      {/* ── Center: Brand Logo + Prominent Site Name (Centered) ── */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 w-full my-auto px-1">
        <div
          className="shrink-0 rounded-xl overflow-hidden shadow-md transition-transform duration-200 group-hover:scale-105"
          style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.4)' }}
        >
          <div className="sm:hidden">
            <SiteIcon
              name={site.name}
              domain={site.domain}
              faviconUrl={site.faviconUrl}
              size={32}
            />
          </div>
          <div className="hidden sm:block">
            <SiteIcon
              name={site.name}
              domain={site.domain}
              faviconUrl={site.faviconUrl}
              size={38}
            />
          </div>
        </div>

        <h4 className="font-headline font-bold text-[0.92rem] sm:text-[1.06rem] text-white tracking-[-0.015em] group-hover:text-blue-400 transition-colors truncate">
          {site.name}
        </h4>
      </div>

      {/* ── Bottom Row: Small Domain + External Link Icon ── */}
      <div className="flex items-center justify-center gap-1 text-[10.5px] sm:text-[11.5px] text-gray-400/80 font-medium group-hover:text-gray-300 transition-colors w-full min-w-0">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          className="shrink-0 opacity-60 group-hover:opacity-90"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        <span className="truncate">{site.domain}</span>
      </div>

      {/* Subtle hover glow layer */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(6, 182, 212, 0.06) 100%)' }}
      />
    </div>
  );
}
