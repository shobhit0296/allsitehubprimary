'use client';

import type { Site } from '@/lib/data';
import SiteIcon from './SiteIcon';

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
      className="group relative glass-lux rounded-xl sm:rounded-2xl border border-white/[0.08] card-hover-lux cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] w-full min-w-0 overflow-hidden p-3 sm:p-5 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* ── Top Header: Logo + Info + Bookmark ── */}
        <div className="flex items-start gap-2.5 sm:gap-4">
          {/* Logo */}
          <div
            className="shrink-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-md transition-transform duration-200 group-hover:scale-[1.05]"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
          >
            <div className="sm:hidden">
              <SiteIcon
                name={site.name}
                domain={site.domain}
                faviconUrl={site.faviconUrl}
                size={38}
              />
            </div>
            <div className="hidden sm:block">
              <SiteIcon
                name={site.name}
                domain={site.domain}
                faviconUrl={site.faviconUrl}
                size={50}
              />
            </div>
          </div>

          {/* Site name + Tag + Domain */}
          <div className="min-w-0 flex-1 pt-0 pr-5 sm:pr-6">
            <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1 flex-wrap">
              <h4 className="font-headline text-[0.88rem] sm:text-[1.05rem] font-bold text-[var(--text-primary)] group-hover:text-blue-400 transition-colors truncate tracking-[-0.015em] leading-tight">
                {site.name}
              </h4>
              {tag && (
                <span className={`${tag.cls} text-[9px] sm:text-[10px] px-1.5 py-0.2`}>
                  {tag.label}
                </span>
              )}
            </div>

            {/* Domain */}
            <div className="flex items-center gap-1 text-[10.5px] sm:text-[11.5px] text-[var(--text-muted)] font-medium">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0 opacity-60"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="truncate">{site.domain}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-2.5 sm:my-3 border-t border-white/[0.06]" />

        {/* Description */}
        <p className="text-[0.76rem] sm:text-[0.85rem] text-[var(--text-secondary)] leading-[1.45] sm:leading-[1.55] line-clamp-2">
          {site.description || `Stream and watch on ${site.name}.`}
        </p>
      </div>

      {/* Bookmark button */}
      <button
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        className="bookmark-btn absolute top-2 right-2 sm:top-3.5 sm:right-3.5 p-1 sm:p-1.5 leading-none shrink-0 rounded-lg hover:bg-white/[0.08] transition-all duration-200 z-10"
        onClick={e => {
          e.stopPropagation();
          onToggleBookmark(site.id);
        }}
        style={{ color: isBookmarked ? 'var(--yellow)' : 'var(--text-muted)', opacity: isBookmarked ? 1 : undefined }}
      >
        <span
          className={`material-symbols-outlined text-[17px] sm:text-[20px] transition-all ${
            isBookmarked
              ? 'opacity-100'
              : 'opacity-40 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100'
          }`}
          style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {isBookmarked ? 'star' : 'star_border'}
        </span>
      </button>

      {/* Subtle hover glow */}
      <div
        className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.04) 0%,rgba(6,182,212,0.04) 100%)' }}
      />
    </div>
  );
}
