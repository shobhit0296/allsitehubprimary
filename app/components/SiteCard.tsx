'use client';

import type { Site } from '@/lib/data';

interface SiteCardProps {
  site: Site;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}

const TAG_MAP: Record<string, { label: string; color: string; border: string }> = {
  trusted:  { label: 'TRUSTED',  color: '#a5b4fc', border: 'rgba(99,102,241,0.4)'  },
  featured: { label: 'FEATURED', color: '#fcd34d', border: 'rgba(245,158,11,0.4)'  },
  new:      { label: 'NEW',      color: '#6ee7b7', border: 'rgba(16,185,129,0.4)'  },
};

interface SiteBrandConfig {
  displayName?: string;
  color: string;
  uppercase?: boolean;
  letterSpacing?: string;
}

// ── Exact Website Brand Colors & Names ──
const BRAND_CONFIGS: Record<string, SiteBrandConfig> = {
  // Movies & Shows
  'pantyflix.org': { displayName: 'PANTYFLIX', color: '#EC4899', uppercase: true },
  '1shows.org': { displayName: '1 Shows', color: '#38BDF8' },
  '1tube.org': { displayName: '1 Tube', color: '#A855F7' },
  '7movies.in': { displayName: '7 Movies', color: '#F59E0B' },
  'cinezo.net': { displayName: 'CINEZO', color: '#3B82F6', uppercase: true },
  '1flex.org': { displayName: '1FLEX', color: '#E50914', uppercase: true },
  'redflix.club': { displayName: 'REDFLIX', color: '#EF4444', uppercase: true },
  'shuttletv.su': { displayName: 'shuttleTV', color: '#818CF8' },
  'flyflix.net': { displayName: 'FLY FLIX', color: '#F43F5E', uppercase: true },
  'youshows.org': { displayName: 'YOU SHOWS', color: '#38BDF8', uppercase: true },
  'flixhub.studio': { displayName: 'FLIXHUB', color: '#6366F1', uppercase: true },
  'primeshows.org': { displayName: 'PRIME MOVIES', color: '#0EA5E9', uppercase: true },
  'dulo.cx': { displayName: 'DULO', color: '#14B8A6', uppercase: true },
  'stigstream.ru': { displayName: 'STIGSTREAM', color: '#10B981', uppercase: true },
  'flixeo.tv': { displayName: 'FLIXEO', color: '#8B5CF6', uppercase: true },
  'willow.arlen.icu': { displayName: 'WILLOW', color: '#FFFFFF', uppercase: true, letterSpacing: '0.08em' },
  'cinrift.me': { displayName: 'CINRIFT', color: '#06B6D4', uppercase: true },
  'cinemove.cc': { displayName: 'Cinemove', color: '#FBBF24' },
  'vuflix.co': { displayName: 'Vuflix', color: '#38BDF8' },
  '7reels.cc': { displayName: '7reels', color: '#EF4444' },
  'pixelflix.cc': { displayName: 'Pixel Flix', color: '#06B6D4' },
  'anicine.xyz': { displayName: 'Anicine', color: '#F43F5E' },
  'flixhub.aniflix.uno': { displayName: 'FlixHub', color: '#D946EF' },
  'nippleflix.org': { displayName: 'NIPPLEFLIX', color: '#EC4899', uppercase: true },
  'cinehd.vc': { displayName: 'CineHD', color: '#60A5FA' },
  'allflix.org': { displayName: 'AllFlix', color: '#F97316' },
  'pvrplay': { displayName: 'PVR Play', color: '#EF4444' },

  // Anime
  'enma.lol': { displayName: 'ENMA', color: '#F97316', uppercase: true },
  'yenime.net': { displayName: 'YENIME', color: '#A855F7', uppercase: true },
  'anishows.org': { displayName: 'ANY SHOWS', color: '#06B6D4', uppercase: true },
  'animetvplus.xyz': { displayName: 'ANIME TV', color: '#F43F5E', uppercase: true },
  'kaa.lt': { displayName: 'KAA', color: '#8B5CF6', uppercase: true },
  'justanime.to': { displayName: 'JUST ANIME', color: '#EF4444', uppercase: true },
  'animesalt.link': { displayName: 'ANIME SALT', color: '#38BDF8', uppercase: true },
  'senpaiflix.fun': { displayName: 'SENPAI FLIX', color: '#EC4899', uppercase: true },
  'animextrons.co.in': { displayName: 'ANIMEXTRONS', color: '#3B82F6', uppercase: true },
  'anikototv.to': { displayName: 'ANIKOTO TV', color: '#A855F7', uppercase: true },
  'watchanimez.me': { displayName: 'WatchAnimez', color: '#F43F5E' },
  'aniwaves.ru': { displayName: 'AniWaves', color: '#A855F7' },
  'aniflix.uno': { displayName: 'AniFlix', color: '#F43F5E' },
  'animerulz.co.in': { displayName: 'AnimeRulz', color: '#10B981' },
  'dub.animeplay.icu': { displayName: 'Anime Play', color: '#38BDF8' },

  // Manga
  'mangaball.net': { displayName: 'MANGABALL', color: '#EF4444', uppercase: true },
  'comick.dev': { displayName: 'COMICK', color: '#8B5CF6', uppercase: true },
  'qtoon.org': { displayName: 'Q TOON', color: '#D946EF', uppercase: true },
  'weebcentral.com': { displayName: 'WEEB CENTRAL', color: '#06B6D4', uppercase: true },
  'kingofshojo.com': { displayName: 'KING OF SHOJO', color: '#EC4899', uppercase: true },
  'webtoons.com': { displayName: 'WEBTOON', color: '#00DC64', uppercase: true },
  'anireads.cc': { displayName: 'Manga Reader', color: '#818CF8' },
  'mangadex.org': { displayName: 'MangaDex', color: '#FF6740' },

  // Live TV & Sports
  'ondemand.st': { displayName: 'ONDEMAND', color: '#10B981', uppercase: true },
  'thestreameast.top': { displayName: 'STREAM EAST', color: '#F97316', uppercase: true },
  'stmify.com': { displayName: 'STMIFY', color: '#3B82F6', uppercase: true },
  'famelack.com': { displayName: 'FAMELACK', color: '#F59E0B', uppercase: true },
  'publiciptv.com': { displayName: 'PUBLIC IPTV', color: '#14B8A6', uppercase: true },
  'en97.sportplus.watch': { displayName: 'SPORTPLUS', color: '#22C55E', uppercase: true },
  'streameastnow.net': { displayName: 'STREAM EAST NOW', color: '#F97316', uppercase: true },

  // Paid
  'netflix.com': { displayName: 'NETFLIX', color: '#E50914', uppercase: true, letterSpacing: '0.08em' },
  'hotstar.com': { displayName: 'HOTSTAR', color: '#38BDF8', uppercase: true },
  'hbomax.com': { displayName: 'HBO MAX', color: '#A855F7', uppercase: true },
  'tv.apple.com': { displayName: 'Apple TV', color: '#F1F5F9' },
  'primevideo.com': { displayName: 'Prime Video', color: '#00A8E1' },
  'sso.crunchyroll.com': { displayName: 'Crunchyroll', color: '#F47521' },
  'crunchyroll.com': { displayName: 'Crunchyroll', color: '#F47521' },
  'peacocktv.com': { displayName: 'PEACOCK', color: '#00A4E4', uppercase: true },
  'shudder.com': { displayName: 'SHUDDER', color: '#EF4444', uppercase: true },
  'auth.hulu.com': { displayName: 'hulu', color: '#1CE783' },
  'hulu.com': { displayName: 'hulu', color: '#1CE783' },
  'viki.com': { displayName: 'VIKI', color: '#00A8E8', uppercase: true },
  'paramountplus.com': { displayName: 'PARAMOUNT', color: '#0064FF', uppercase: true },
  'mgmplus.com': { displayName: 'MGM', color: '#D4AF37', uppercase: true },
  'amcplus.com': { displayName: 'AMC', color: '#E11D48', uppercase: true },
  'disneyplus.com': { displayName: 'Disney+', color: '#60A5FA' },

  // Apps
  'netmirror.gg': { displayName: 'NET MIRROR', color: '#10B981', uppercase: true },
  'moviesbox.com.co': { displayName: 'MOVIES BOX', color: '#FBBF24', uppercase: true },
  'pikashowtv.in': { displayName: 'PIKASHOWS', color: '#F97316', uppercase: true },
  'playtorrio.pages.dev': { displayName: 'PLAY TORRIO', color: '#8B5CF6', uppercase: true },
  'youcineapkpro.com': { displayName: 'YOU CINE', color: '#EF4444', uppercase: true },
  'onstreamapks.app': { displayName: 'ONSTREAM', color: '#F59E0B', uppercase: true },
};

const VIBRANT_PALETTE = [
  '#38BDF8', '#F43F5E', '#A855F7', '#10B981',
  '#F59E0B', '#EC4899', '#06B6D4', '#818CF8',
  '#F97316', '#60A5FA', '#14B8A6', '#FB7185',
];

function getSiteBrand(domain: string, rawName: string): { displayName: string; color: string; letterSpacing?: string; uppercase?: boolean } {
  const cleanDomain = domain.toLowerCase();
  for (const [key, cfg] of Object.entries(BRAND_CONFIGS)) {
    if (cleanDomain.includes(key) || key.includes(cleanDomain)) {
      return {
        displayName: cfg.displayName || rawName,
        color: cfg.color,
        letterSpacing: cfg.letterSpacing,
        uppercase: cfg.uppercase,
      };
    }
  }

  // Fallback clean name
  let cleanName = rawName.trim();
  if (cleanName.includes('-')) cleanName = cleanName.split('-')[0].trim();
  if (cleanName.length > 20) cleanName = cleanName.slice(0, 18).trim();

  let hash = 0;
  const str = domain || rawName;
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
  const color = VIBRANT_PALETTE[Math.abs(hash) % VIBRANT_PALETTE.length];

  return { displayName: cleanName, color };
}

export default function SiteCard({ site, isBookmarked = false, onToggleBookmark }: SiteCardProps) {
  const tagKey = site.tags?.find(t => TAG_MAP[t])
    ?? (site.isTrusted ? 'trusted' : site.isFeatured ? 'featured' : site.isNew ? 'new' : null);
  const tag = tagKey ? TAG_MAP[tagKey] : null;

  const domain = (site.domain || site.url)
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];

  const brand = getSiteBrand(domain, site.name);
  const isLong = brand.displayName.length > 11;
  const isVeryLong = brand.displayName.length > 15;
  const nameClass = `sc-name${isVeryLong ? ' sc-name--xlong' : isLong ? ' sc-name--long' : ''}`;

  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${brand.displayName}`}
      className="sc-card"
    >
      {/* ── Row 1: badge + star ── */}
      <div className="sc-toprow">
        {tag ? (
          <span className="sc-badge" style={{ color: tag.color, borderColor: tag.border }}>
            {tag.label}
          </span>
        ) : (
          <span />
        )}

        {onToggleBookmark ? (
          <button
            type="button"
            className={`sc-star${isBookmarked ? ' sc-star--on' : ''}`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Save site'}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onToggleBookmark(site.id);
            }}
          >
            {isBookmarked ? '★' : '☆'}
          </button>
        ) : (
          <span />
        )}
      </div>

      {/* ── Row 2: Exact website name in exact original color and bold size (NO logo image) ── */}
      <div className="sc-center-wrap">
        <span
          className={nameClass}
          title={brand.displayName}
          style={{
            color: brand.color,
            letterSpacing: brand.letterSpacing || (isVeryLong ? '-0.01em' : isLong ? '-0.018em' : '-0.025em'),
            textTransform: brand.uppercase ? 'uppercase' : 'none',
          }}
        >
          {brand.displayName}
        </span>
      </div>

      {/* ── Row 3: domain URL ── */}
      <div className="sc-domain">
        <svg width="11.5" height="11.5" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true" style={{ flexShrink: 0 }}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        <span>{domain}</span>
      </div>
    </a>
  );
}


