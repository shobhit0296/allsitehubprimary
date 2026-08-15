'use client';

import type { Site } from '@/lib/data';
import SiteIcon from './SiteIcon';

interface SiteCardProps {
  site: Site;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}

const TAG_MAP: Record<string, { label: string; cls: string }> = {
  trusted:  { label: 'TRUSTED',  cls: 'bg-[#1e1b4b]/90 text-[#a5b4fc] border-[#6366f1]/40' },
  featured: { label: 'FEATURED', cls: 'bg-[#451a03]/90 text-[#fcd34d] border-[#f59e0b]/40' },
  new:      { label: 'NEW',      cls: 'bg-[#064e3b]/90 text-[#6ee7b7] border-[#10b981]/40' },
};

export default function SiteCard({ site, isBookmarked = false, onToggleBookmark }: SiteCardProps) {
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
      className="group relative rounded-xl sm:rounded-2xl border border-[#1e2438] hover:border-[#384266] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b14] w-full min-w-0 overflow-hidden px-4 py-3 sm:px-4.5 sm:py-3.5 min-h-[104px] sm:min-h-[116px] md:min-h-[122px] flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.7)] active:scale-[0.98]"
      style={{
        background: 'linear-gradient(180deg, #11162b 0%, #0a0d1c 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 20px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* ── Top Row: Tag (Left) + Bookmark Star (Right) ── */}
      <div className="flex items-center justify-between w-full h-[16px] pointer-events-none">
        {tag ? (
          <span
            className={`text-[7.5px] sm:text-[8.5px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full border shadow-sm ${tag.cls}`}
          >
            {tag.label}
          </span>
        ) : (
          <span className="w-1" />
        )}

        {/* Minimal Bookmark Star */}
        {onToggleBookmark ? (
          <button
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            className="bookmark-btn pointer-events-auto p-0.5 leading-none shrink-0 rounded-md text-[#64748b] hover:text-[#fbbf24] transition-all duration-150 -mr-0.5 -mt-0.5"
            onClick={e => {
              e.stopPropagation();
              onToggleBookmark(site.id);
            }}
          >
            <span
              className={`material-symbols-outlined text-[16px] sm:text-[18px] transition-all ${
                isBookmarked
                  ? 'text-[#fbbf24] opacity-100'
                  : 'text-[#64748b] opacity-40 group-hover:opacity-85'
              }`}
              style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {isBookmarked ? 'star' : 'star_border'}
            </span>
          </button>
        ) : (
          <span className="w-1" />
        )}
      </div>

      {/* ── Center: Brand Icon + Bold Website Name (Prominent & Centered) ── */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-3 w-full my-auto px-1 text-center">
        <div
          className="shrink-0 rounded-lg overflow-hidden transition-transform duration-200 group-hover:scale-105"
          style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.4)' }}
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
              size={32}
            />
          </div>
        </div>

        <h4 className="font-headline font-black text-[1.02rem] sm:text-[1.18rem] text-[#f8fafc] tracking-[-0.02em] group-hover:text-indigo-400 transition-colors truncate">
          {site.name}
        </h4>
      </div>

      {/* ── Bottom Row: Small Domain + External Link Icon ── */}
      <div className="flex items-center justify-center gap-1.5 text-[10.5px] sm:text-[12px] text-[#64748b] font-medium group-hover:text-[#94a3b8] transition-colors w-full min-w-0">
        <svg
          width="10.5"
          height="10.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          className="shrink-0 opacity-70 group-hover:opacity-100"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        <span className="truncate">{site.domain}</span>
      </div>

      {/* Subtle hover sheen */}
      <div
        className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(168, 85, 247, 0.06) 100%)' }}
      />
    </div>
  );
}
