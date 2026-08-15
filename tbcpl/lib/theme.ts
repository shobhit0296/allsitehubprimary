/** Shared category accent colors — used by sidebar and section headers. */
export const CATEGORY_ACCENTS: Record<string, string> = {
  'Movies & Shows': '#8b5cf6',
  Anime: '#3b82f6',
  Manga: '#f59e0b',
  'Live TV & Sports': '#10b981',
  Paid: '#f43f5e',
  Apps: '#06b6d4',
};

export function categoryAccent(name: string): string {
  return CATEGORY_ACCENTS[name] ?? '#3b82f6';
}

export interface ThemeOption {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  secondaryColor: string;
  desc: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: 'cosmic',
    name: 'Cosmic Aether',
    shortName: 'Cosmic',
    icon: '✦',
    color: '#c4b5fd',
    secondaryColor: '#67e8f9',
    desc: 'Lavender & Cyan',
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Neon',
    shortName: 'Cyber',
    icon: '⚡',
    color: '#00f0ff',
    secondaryColor: '#ff007f',
    desc: 'Neon Cyan & Pink',
  },
  {
    id: 'ocean',
    name: 'Midnight Ocean',
    shortName: 'Ocean',
    icon: '🌊',
    color: '#38bdf8',
    secondaryColor: '#3b82f6',
    desc: 'Electric Blue & Ice',
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    shortName: 'Emerald',
    icon: '💎',
    color: '#34d399',
    secondaryColor: '#10b981',
    desc: 'Mint & Deep Forest',
  },
  {
    id: 'amber',
    name: 'Solar Amber',
    shortName: 'Amber',
    icon: '👑',
    color: '#fbbf24',
    secondaryColor: '#f97316',
    desc: 'Gold & Sunset Bronze',
  },
  {
    id: 'crimson',
    name: 'Crimson Velvet',
    shortName: 'Crimson',
    icon: '🔥',
    color: '#fb7185',
    secondaryColor: '#f43f5e',
    desc: 'Ruby & Rose Velvet',
  },
];
