export interface Site {
  id: string;
  name: string;
  url: string;
  domain: string;
  category: string;
  regions: string[];
  tags: string[];
  isTrusted: boolean;
  isNew: boolean;
  isFeatured: boolean;
  description: string;
  faviconUrl?: string;   // custom favicon — overrides Google favicon API
  addedAt: number;
  order: number;         // manual ranking — lower shows first, scoped within its category
}

export interface Category {
  name: string;
  icon: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  { name: 'Movies & Shows', icon: '🎬', description: 'Streaming sites for movies and TV.' },
  { name: 'Anime', icon: '⛩️', description: 'Watch anime online legally and for free.' },
  { name: 'Manga', icon: '📚', description: 'Read manga and comics online.' },
  { name: 'Live TV & Sports', icon: '📺', description: 'Live TV channels and sports streaming.' },
  { name: 'Paid', icon: '💳', description: 'Premium paid streaming services.' },
  { name: 'Apps', icon: '📱', description: 'Media players and streaming apps.' },
];

export const REGIONS = [
  'US', 'UK', 'CA', 'AU', 'IN',
  'DE', 'FR', 'JP', 'KR', 'MX', 'BR', 'IT', 'ES', 'NL', 'PL',
];

/** Simulated base online users per region — used for live fluctuation UI */
export const ONLINE_BASE: Record<string, number> = {
  US: 1847, IN: 1203, UK: 634, CA: 312, AU: 287,
  DE: 198,  BR: 176,  FR: 154, JP: 143, MX: 132,
  KR: 98,   IT: 87,   ES: 92,  NL: 71,  PL: 58,
};

export const REGION_FLAGS: Record<string, string> = {
  Global: '🌍', US: '🇺🇸', UK: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺',
  IN: '🇮🇳', DE: '🇩🇪', FR: '🇫🇷', JP: '🇯🇵', KR: '🇰🇷',
  MX: '🇲🇽', BR: '🇧🇷', IT: '🇮🇹', ES: '🇪🇸', NL: '🇳🇱', PL: '🇵🇱',
};

const now = Date.now();
const d = (days: number) => now - 86_400_000 * days;

const RAW_SITES: Omit<Site, 'order'>[] = [
  // ── Movies & Shows ─────────────────────────────────────────────────────────
  {
    id: 'ms1', name: 'Netflix', url: 'https://www.netflix.com', domain: 'netflix.com',
    category: 'Movies & Shows', regions: ['Global'], tags: ['trusted', 'featured'],
    isTrusted: true, isNew: false, isFeatured: true,
    description: "World's leading streaming platform with thousands of originals.",
    addedAt: d(120),
  },
  {
    id: 'ms2', name: 'Prime Video', url: 'https://www.primevideo.com', domain: 'primevideo.com',
    category: 'Movies & Shows', regions: ['Global'], tags: ['trusted'],
    isTrusted: true, isNew: false, isFeatured: false,
    description: 'Amazon Prime streaming with award-winning originals and live sports.',
    addedAt: d(110),
  },
  {
    id: 'ms3', name: 'Disney+', url: 'https://www.disneyplus.com', domain: 'disneyplus.com',
    category: 'Movies & Shows', regions: ['Global'], tags: ['trusted', 'featured'],
    isTrusted: true, isNew: false, isFeatured: true,
    description: 'Disney, Pixar, Marvel, Star Wars, and National Geographic.',
    addedAt: d(100),
  },
  {
    id: 'ms4', name: 'Max', url: 'https://www.max.com', domain: 'max.com',
    category: 'Movies & Shows', regions: ['US', 'Global'], tags: ['trusted'],
    isTrusted: true, isNew: false, isFeatured: false,
    description: 'Premium HBO content, Warner Bros. films, and Max originals.',
    addedAt: d(90),
  },
  {
    id: 'ms5', name: 'Apple TV+', url: 'https://tv.apple.com', domain: 'tv.apple.com',
    category: 'Movies & Shows', regions: ['Global'], tags: ['trusted'],
    isTrusted: true, isNew: false, isFeatured: false,
    description: 'Apple Originals — award-winning series, films, and documentaries.',
    addedAt: d(85),
  },
  {
    id: 'ms6', name: 'Hulu', url: 'https://www.hulu.com', domain: 'hulu.com',
    category: 'Movies & Shows', regions: ['US'], tags: ['trusted'],
    isTrusted: true, isNew: false, isFeatured: false,
    description: 'Current-season TV episodes, movies, and Hulu originals.',
    addedAt: d(80),
  },
  {
    id: 'ms7', name: 'Peacock', url: 'https://www.peacocktv.com', domain: 'peacocktv.com',
    category: 'Movies & Shows', regions: ['US'], tags: [],
    isTrusted: false, isNew: false, isFeatured: false,
    description: 'NBCUniversal streaming with free and premium tiers.',
    addedAt: d(75),
  },
  {
    id: 'ms8', name: 'Paramount+', url: 'https://www.paramountplus.com', domain: 'paramountplus.com',
    category: 'Movies & Shows', regions: ['US', 'UK', 'AU', 'CA'], tags: [],
    isTrusted: false, isNew: false, isFeatured: false,
    description: 'CBS, BET, MTV, Nickelodeon content plus Paramount originals.',
    addedAt: d(70),
  },
  {
    id: 'ms9', name: 'Tubi', url: 'https://tubitv.com', domain: 'tubitv.com',
    category: 'Movies & Shows', regions: ['US', 'CA', 'AU'], tags: ['new'],
    isTrusted: false, isNew: true, isFeatured: false,
    description: 'Free ad-supported streaming with 50,000+ movies and shows.',
    addedAt: d(8),
  },
  {
    id: 'ms10', name: 'Hotstar', url: 'https://www.hotstar.com', domain: 'hotstar.com',
    category: 'Movies & Shows', regions: ['IN'], tags: ['trusted', 'featured'],
    isTrusted: true, isNew: false, isFeatured: true,
    description: "India's biggest streaming platform with live cricket and Bollywood.",
    addedAt: d(65),
  },
  {
    id: 'ms11', name: 'Pluto TV', url: 'https://pluto.tv', domain: 'pluto.tv',
    category: 'Movies & Shows', regions: ['US', 'UK', 'DE', 'ES'], tags: ['new'],
    isTrusted: false, isNew: true, isFeatured: false,
    description: 'Free live TV + on-demand streaming with 250+ channels.',
    addedAt: d(5),
  },
  {
    id: 'ms12', name: 'Mubi', url: 'https://mubi.com', domain: 'mubi.com',
    category: 'Movies & Shows', regions: ['Global'], tags: ['trusted'],
    isTrusted: true, isNew: false, isFeatured: false,
    description: 'Curated hand-picked films — a cinema lover\'s streaming service.',
    addedAt: d(60),
  },

  // ── Anime ──────────────────────────────────────────────────────────────────
  {
    id: 'an1', name: 'Crunchyroll', url: 'https://www.crunchyroll.com', domain: 'crunchyroll.com',
    category: 'Anime', regions: ['Global'], tags: ['trusted', 'featured'],
    isTrusted: true, isNew: false, isFeatured: true,
    description: "World's largest anime library with daily simulcasts.",
    addedAt: d(115),
  },
  {
    id: 'an2', name: 'HiDive', url: 'https://www.hidive.com', domain: 'hidive.com',
    category: 'Anime', regions: ['US', 'CA', 'UK', 'AU'], tags: ['trusted'],
    isTrusted: true, isNew: false, isFeatured: false,
    description: 'Premium anime streaming with exclusive simulcasts and dubs.',
    addedAt: d(90),
  },
  {
    id: 'an3', name: 'Aniwatch', url: 'https://aniwatch.to', domain: 'aniwatch.to',
    category: 'Anime', regions: ['Global'], tags: ['new'],
    isTrusted: false, isNew: true, isFeatured: false,
    description: 'Free anime streaming with high-quality subs and dubs.',
    addedAt: d(12),
  },
  {
    id: 'an4', name: 'AnimePahe', url: 'https://animepahe.ru', domain: 'animepahe.ru',
    category: 'Anime', regions: ['Global'], tags: [],
    isTrusted: false, isNew: false, isFeatured: false,
    description: 'Mini-compressed anime streams and downloads in HD.',
    addedAt: d(55),
  },
  {
    id: 'an5', name: 'Bilibili', url: 'https://www.bilibili.com', domain: 'bilibili.com',
    category: 'Anime', regions: ['JP', 'Global'], tags: [],
    isTrusted: false, isNew: false, isFeatured: false,
    description: 'Chinese video platform with extensive anime library.',
    addedAt: d(50),
  },
  {
    id: 'an6', name: 'AnimeDao', url: 'https://animedao.to', domain: 'animedao.to',
    category: 'Anime', regions: ['Global'], tags: [],
    isTrusted: false, isNew: false, isFeatured: false,
    description: 'Watch anime online free in HD quality, no signup needed.',
    addedAt: d(45),
  },

  // ── Manga ──────────────────────────────────────────────────────────────────
  {
    id: 'mg1', name: 'MangaDex', url: 'https://mangadex.org', domain: 'mangadex.org',
    category: 'Manga', regions: ['Global'], tags: ['trusted', 'featured'],
    isTrusted: true, isNew: false, isFeatured: true,
    description: 'The largest manga scanlation platform with 500k+ chapters.',
    addedAt: d(100),
  },
  {
    id: 'mg2', name: 'Manga Plus', url: 'https://mangaplus.shueisha.co.jp', domain: 'mangaplus.shueisha.co.jp',
    category: 'Manga', regions: ['Global'], tags: ['trusted'],
    isTrusted: true, isNew: false, isFeatured: false,
    description: 'Official Shueisha manga — One Piece, Naruto, Dragon Ball, and more.',
    addedAt: d(95),
  },
  {
    id: 'mg3', name: 'Webtoon', url: 'https://www.webtoons.com', domain: 'webtoons.com',
    category: 'Manga', regions: ['Global'], tags: ['trusted'],
    isTrusted: true, isNew: false, isFeatured: false,
    description: 'Free digital comics and webtoons from creators worldwide.',
    addedAt: d(90),
  },
  {
    id: 'mg4', name: 'MangaFire', url: 'https://mangafire.to', domain: 'mangafire.to',
    category: 'Manga', regions: ['Global'], tags: ['new'],
    isTrusted: false, isNew: true, isFeatured: false,
    description: 'Read manga online in high quality, updated daily.',
    addedAt: d(6),
  },
  {
    id: 'mg5', name: 'MangaSee', url: 'https://mangasee123.com', domain: 'mangasee123.com',
    category: 'Manga', regions: ['Global'], tags: [],
    isTrusted: false, isNew: false, isFeatured: false,
    description: 'One of the biggest manga reading sites with a clean reader.',
    addedAt: d(60),
  },

  // ── Live TV & Sports ───────────────────────────────────────────────────────
  {
    id: 'sp1', name: 'ESPN+', url: 'https://www.espnplus.com', domain: 'espnplus.com',
    category: 'Live TV & Sports', regions: ['US'], tags: ['trusted'],
    isTrusted: true, isNew: false, isFeatured: false,
    description: 'Premium sports streaming with live events and ESPN originals.',
    addedAt: d(100),
  },
  {
    id: 'sp2', name: 'DAZN', url: 'https://www.dazn.com', domain: 'dazn.com',
    category: 'Live TV & Sports', regions: ['Global'], tags: ['trusted', 'featured'],
    isTrusted: true, isNew: false, isFeatured: true,
    description: 'Live and on-demand sports — football, boxing, MMA and more.',
    addedAt: d(90),
  },
  {
    id: 'sp3', name: 'fuboTV', url: 'https://www.fubo.tv', domain: 'fubo.tv',
    category: 'Live TV & Sports', regions: ['US', 'CA', 'ES'], tags: [],
    isTrusted: false, isNew: false, isFeatured: false,
    description: 'Sports-first live TV streaming with 100+ channels.',
    addedAt: d(80),
  },
  {
    id: 'sp4', name: 'BBC iPlayer', url: 'https://www.bbc.co.uk/iplayer', domain: 'bbc.co.uk',
    category: 'Live TV & Sports', regions: ['UK'], tags: ['trusted'],
    isTrusted: true, isNew: false, isFeatured: false,
    description: 'Watch BBC TV programmes, news, and radio on demand.',
    addedAt: d(75),
  },
  {
    id: 'sp5', name: 'SonyLIV', url: 'https://www.sonyliv.com', domain: 'sonyliv.com',
    category: 'Live TV & Sports', regions: ['IN'], tags: [],
    isTrusted: false, isNew: false, isFeatured: false,
    description: 'Indian OTT with live sports, movies, TV shows and originals.',
    addedAt: d(65),
  },
  {
    id: 'sp6', name: 'Sling TV', url: 'https://www.sling.com', domain: 'sling.com',
    category: 'Live TV & Sports', regions: ['US'], tags: [],
    isTrusted: false, isNew: false, isFeatured: false,
    description: 'Affordable live TV streaming — no contracts needed.',
    addedAt: d(60),
  },

  // ── Paid ───────────────────────────────────────────────────────────────────
  {
    id: 'pd1', name: 'Starz', url: 'https://www.starz.com', domain: 'starz.com',
    category: 'Paid', regions: ['US', 'CA'], tags: [],
    isTrusted: false, isNew: false, isFeatured: false,
    description: 'Premium cable network with blockbuster movies and originals.',
    addedAt: d(80),
  },
  {
    id: 'pd2', name: 'Shudder', url: 'https://www.shudder.com', domain: 'shudder.com',
    category: 'Paid', regions: ['US', 'UK', 'CA', 'AU'], tags: ['new'],
    isTrusted: false, isNew: true, isFeatured: false,
    description: 'Premium horror, thriller, and supernatural streaming.',
    addedAt: d(9),
  },
  {
    id: 'pd3', name: 'BritBox', url: 'https://www.britbox.com', domain: 'britbox.com',
    category: 'Paid', regions: ['US', 'UK', 'CA', 'AU'], tags: ['trusted'],
    isTrusted: true, isNew: false, isFeatured: false,
    description: 'The best of British TV from BBC, ITV, Channel 4, and more.',
    addedAt: d(70),
  },

  // ── Apps ───────────────────────────────────────────────────────────────────
  {
    id: 'ap1', name: 'Plex', url: 'https://www.plex.tv', domain: 'plex.tv',
    category: 'Apps', regions: ['Global'], tags: ['trusted', 'featured'],
    isTrusted: true, isNew: false, isFeatured: true,
    description: 'Personal media server and free ad-supported streaming.',
    addedAt: d(100),
  },
  {
    id: 'ap2', name: 'Kodi', url: 'https://kodi.tv', domain: 'kodi.tv',
    category: 'Apps', regions: ['Global'], tags: ['trusted'],
    isTrusted: true, isNew: false, isFeatured: false,
    description: 'Open-source media player — stream anything, anywhere.',
    addedAt: d(95),
  },
  {
    id: 'ap3', name: 'VLC', url: 'https://www.videolan.org/vlc', domain: 'videolan.org',
    category: 'Apps', regions: ['Global'], tags: ['trusted'],
    isTrusted: true, isNew: false, isFeatured: false,
    description: 'Free, open-source media player supporting virtually any format.',
    addedAt: d(90),
  },
  {
    id: 'ap4', name: 'Infuse', url: 'https://firecore.com/infuse', domain: 'firecore.com',
    category: 'Apps', regions: ['Global'], tags: [],
    isTrusted: false, isNew: false, isFeatured: false,
    description: 'Beautiful video player for Apple devices — supports all formats.',
    addedAt: d(75),
  },
];

// Ranking is scoped per category (that's how sites are grouped for display),
// so the initial `order` is just each site's position within its own category
// block above — preserving the original hand-curated ordering.
export const SITES: Site[] = (() => {
  const counters: Record<string, number> = {};
  return RAW_SITES.map(site => {
    const order = counters[site.category] ?? 0;
    counters[site.category] = order + 1;
    return { ...site, order };
  });
})();

export function getSitesByCategory(sites: Site[]): Record<string, Site[]> {
  return CATEGORIES.reduce((acc, cat) => {
    acc[cat.name] = sites
      .filter(s => s.category === cat.name)
      .sort((a, b) => a.order - b.order);
    return acc;
  }, {} as Record<string, Site[]>);
}

export function filterSites(
  sites: Site[],
  search: string,
  region: string,
  category: string,
): Site[] {
  let result = sites;
  if (category && category !== 'all') {
    result = result.filter(s => s.category === category);
  }
  if (region) {
    // Global-tagged sites appear in every region filter
    result = result.filter(s => s.regions.includes(region) || s.regions.includes('Global'));
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.domain.toLowerCase().includes(q)
    );
  }
  return result;
}
