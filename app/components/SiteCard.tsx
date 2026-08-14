'use client';

import type { Site } from '@/lib/data';
import SiteIcon from './SiteIcon';

interface SiteCardProps {
  site: Site;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

const TAG_MAP: Record<string, { label: string; cls: string }> = {
  trusted:  { label: 'TRUSTED',  cls: 'bg-[#1e1b4b]/90 text-indigo-300 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]' },
  featured: { label: 'FEATURED', cls: 'bg-[#451a03]/90 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' },
  new:      { label: 'NEW',      cls: 'bg-[#064e3b]/90 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' },
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
      className="group relative rounded-2xl border border-white/[0.08] hover:border-white/[0.25] hover:bg-[#151a2e] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b14] w-full min-w-0 overflow-hidden p-3 sm:p-3.5 h-[116px] sm:h-[132px] flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
      style={{
        background: 'linear-gradient(180deg, #131728 0%, #0a0d18 100%)',
      }}
    >
      {/* ── Top Row: Tag (Left) + Bookmark Star (Right) ── */}
      <div className="flex items-center justify-between w-full min-h-[20px] pointer-events-none">
        {tag ? (
          <span
            className={`text-[7.5px] sm:text-[8px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-full border ${tag.cls}`}
          >
            {tag.label}
          </span>
        ) : (
          <span className="w-1" />
        )}

        {/* Minimal Bookmark Star */}
        <button
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          className="bookmark-btn pointer-events-auto p-0.5 leading-none shrink-0 rounded-md text-gray-400/80 hover:text-amber-400 transition-all duration-150 -mr-0.5 -mt-0.5"
          onClick={e => {
            e.stopPropagation();
            onToggleBookmark(site.id);
          }}
        >
          <span
            className={`material-symbols-outlined text-[16px] sm:text-[18px] transition-all ${
              isBookmarked
                ? 'text-amber-400 opacity-100'
                : 'text-gray-400 opacity-40 group-hover:opacity-80'
            }`}
            style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {isBookmarked ? 'star' : 'star_border'}
          </span>
        </button>
      </div>

      {/* ── Center: Brand Logo + Bold Website Name (Prominent & Centered) ── */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 w-full my-auto px-1 text-center">
        <div
          className="shrink-0 rounded-lg overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-105"
        >
          <div className="sm:hidden">
            <SiteIcon
              name={site.name}
              domain={site.domain}
              faviconUrl={site.faviconUrl}
              size={28}
            />
          </div>
          <div className="hidden sm:block">
            <SiteIcon
              name={site.name}
              domain={site.domain}
              faviconUrl={site.faviconUrl}
              size={34}
            />
          </div>
        </div>

        <h4 className="font-headline font-black text-[0.98rem] sm:text-[1.14rem] text-white tracking-[-0.02em] group-hover:text-indigo-400 transition-colors truncate">
          {site.name}
        </h4>
      </div>

      {/* ── Bottom Row: Small Domain + External Link Icon ── */}
      <div className="flex items-center justify-center gap-1.5 text-[10.5px] sm:text-[11.5px] text-gray-400/80 font-normal group-hover:text-gray-300 transition-colors w-full min-w-0">
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

      {/* Subtle hover glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)' }}
      />
    </div>
  );
}
