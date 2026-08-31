const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('Sites count in db.json:', db.sites.length);
console.log('Categories count:', db.categories.length);
console.log('Requests count:', db.requests ? db.requests.length : 0);

// Also sync to tbcpl if directory exists
const tbcplDbPath = path.join(__dirname, '..', 'tbcpl', 'data', 'db.json');
if (fs.existsSync(path.dirname(tbcplDbPath))) {
  fs.writeFileSync(tbcplDbPath, JSON.stringify(db, null, 2), 'utf8');
}

const rawSitesJson = JSON.stringify(db.sites, null, 2);

const dataTsContent = `export interface Site {
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
  faviconUrl?: string;   // auto-resolved at runtime by SiteIcon — no need to hardcode
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
  { name: 'Anime',          icon: '⛩️', description: 'Watch anime online legally and for free.' },
  { name: 'Manga',          icon: '📚', description: 'Read manga and comics online.' },
  { name: 'Live TV & Sports', icon: '📺', description: 'Live TV channels and sports streaming.' },
  { name: 'Paid',           icon: '💳', description: 'Premium paid streaming services.' },
  { name: 'Apps',           icon: '📱', description: 'Media players and streaming apps.' },
];

export const REGIONS = [
  'Global', 'US', 'UK', 'CA', 'AU', 'IN',
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

export const SITES: Site[] = ${rawSitesJson};

export function filterSites(
  sites: Site[],
  search: string,
  region: string,
  category: string,
): Site[] {
  return sites
    .filter(site => {
      // Category filter
      if (category !== 'all' && site.category !== category) return false;

      // Region filter
      if (region !== 'Global' && !site.regions.includes('Global') && !site.regions.includes(region)) return false;

      // Search query filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = site.name.toLowerCase().includes(q);
        const matchesDomain = site.domain.toLowerCase().includes(q);
        const matchesCat = site.category.toLowerCase().includes(q);
        const matchesDesc = site.description.toLowerCase().includes(q);
        const matchesTags = site.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDomain && !matchesCat && !matchesDesc && !matchesTags) return false;
      }

      return true;
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getSitesByCategory(sites: Site[]): Record<string, Site[]> {
  return sites.reduce((acc, site) => {
    if (!acc[site.category]) acc[site.category] = [];
    acc[site.category].push(site);
    return acc;
  }, {} as Record<string, Site[]>);
}
`;

const dataTsPath = path.join(__dirname, '..', 'lib', 'data.ts');
fs.writeFileSync(dataTsPath, dataTsContent, 'utf8');

const tbcplDataTsPath = path.join(__dirname, '..', 'tbcpl', 'lib', 'data.ts');
if (fs.existsSync(path.dirname(tbcplDataTsPath))) {
  fs.writeFileSync(tbcplDataTsPath, dataTsContent, 'utf8');
}

console.log('Successfully synced all 76 sites to lib/data.ts!');
