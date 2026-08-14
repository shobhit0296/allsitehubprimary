'use client';

import { useState, useCallback } from 'react';
import type { Site } from '@/lib/data';

interface SiteCardProps {
  site: Site;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

const TAG_MAP: Record<string, { label: string; cls: string }> = {
  trusted:  { label: 'TRUSTED',  cls: 'bg-[#1e1b4b]/90 text-[#a5b4fc] border-[#6366f1]/50 shadow-[0_0_10px_rgba(99,102,241,0.25)]' },
  featured: { label: 'FEATURED', cls: 'bg-[#451a03]/90 text-[#fcd34d] border-[#f59e0b]/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]' },
  new:      { label: 'NEW',      cls: 'bg-[#064e3b]/90 text-[#6ee7b7] border-[#10b981]/50 shadow-[0_0_10px_rgba(16,185,129,0.25)]' },
};

function BrandDisplay({ name, domain, faviconUrl }: { name: string; domain: string; faviconUrl?: string }) {
  const cleanDomain = domain ? domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] : '';
  const sources: string[] = [];

  if (faviconUrl?.trim() && !faviconUrl.includes('google.com/s2/favicons') && !faviconUrl.includes('duckduckgo.com/ip3') && !faviconUrl.includes('icon.horse')) {
    sources.push(faviconUrl.trim());
  }
  if (cleanDomain) {
    sources.push(`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256`);
    sources.push(`https://icons.duckduckgo.com/ip3/${cleanDomain}.ico`);
    sources.push(`https://icon.horse/icon/${cleanDomain}`);
  }

  const [step, setStep] = useState(0);
  const [imgFailed, setImgFailed] = useState(sources.length === 0);

  const handleError = useCallback(() => {
    setStep(prev => {
      const next = prev + 1;
      if (next >= sources.length) setImgFailed(true);
      return next;
    });
  }, [sources.length]);

  return (
    <div className="flex items-center justify-center w-full my-auto px-2 min-h-[38px] sm:min-h-[46px] max-h-[46px] sm:max-h-[54px] overflow-hidden">
      {!imgFailed && sources[step] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={sources[step]}
          src={sources[step]}
          alt={name}
          onError={handleError}
          className="max-h-[34px] sm:max-h-[42px] max-w-[85%] object-contain select-none transition-transform duration-200 group-hover:scale-105 drop-shadow-md"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
        />
      ) : (
        <span className="font-headline font-black text-[1.05rem] sm:text-[1.22rem] text-[#f8fafc] tracking-[-0.02em] group-hover:text-indigo-400 transition-colors select-none truncate">
          {name}
        </span>
      )}
    </div>
  );
}

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
      className="group relative rounded-2xl border border-[#1e2438] hover:border-[#3b456b] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b14] w-full min-w-0 overflow-hidden px-3 py-2 sm:px-3.5 sm:py-2.5 h-[94px] sm:h-[108px] md:h-[114px] flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.7)] active:scale-[0.98]"
      style={{
        background: 'linear-gradient(180deg, #101426 0%, #090c18 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 18px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* ── Top Row: Tag (Left) + Bookmark Star (Right) ── */}
      <div className="flex items-center justify-between w-full h-[16px] pointer-events-none">
        {tag ? (
          <span
            className={`text-[7px] sm:text-[7.5px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full border shadow-sm ${tag.cls}`}
          >
            {tag.label}
          </span>
        ) : (
          <span className="w-1" />
        )}

        {/* Minimal Bookmark Star */}
        <button
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          className="bookmark-btn pointer-events-auto p-0.5 leading-none shrink-0 rounded-md text-[#64748b] hover:text-[#fbbf24] transition-all duration-150 -mr-0.5 -mt-0.5"
          onClick={e => {
            e.stopPropagation();
            onToggleBookmark(site.id);
          }}
        >
          <span
            className={`material-symbols-outlined text-[15px] sm:text-[17px] transition-all ${
              isBookmarked
                ? 'text-[#fbbf24] opacity-100'
                : 'text-[#64748b] opacity-40 group-hover:opacity-85'
            }`}
            style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {isBookmarked ? 'star' : 'star_border'}
          </span>
        </button>
      </div>

      {/* ── Center: Clean Uncovered Brand Logo / Mark (No separate text, No box covering) ── */}
      <BrandDisplay
        name={site.name}
        domain={site.domain}
        faviconUrl={site.faviconUrl}
      />

      {/* ── Bottom Row: Small Domain + External Link Icon ── */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-[#64748b] font-medium group-hover:text-[#94a3b8] transition-colors w-full min-w-0">
        <svg
          width="9.5"
          height="9.5"
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
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(168, 85, 247, 0.06) 100%)' }}
      />
    </div>
  );
}
