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
  bgRgb: [number, number, number];
  accentRgb: [number, number, number];
  accent2Rgb: [number, number, number];
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
    bgRgb: [0.039, 0.039, 0.078],
    accentRgb: [0.768, 0.709, 0.992],
    accent2Rgb: [0.403, 0.909, 0.976],
    desc: 'Lavender & Cyan',
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Neon',
    shortName: 'Cyber',
    icon: '⚡',
    color: '#00f0ff',
    secondaryColor: '#ff007f',
    bgRgb: [0.023, 0.031, 0.078],
    accentRgb: [0.0, 0.941, 1.0],
    accent2Rgb: [1.0, 0.0, 0.498],
    desc: 'Neon Cyan & Pink',
  },
  {
    id: 'ocean',
    name: 'Midnight Ocean',
    shortName: 'Ocean',
    icon: '🌊',
    color: '#38bdf8',
    secondaryColor: '#3b82f6',
    bgRgb: [0.015, 0.047, 0.094],
    accentRgb: [0.219, 0.741, 0.972],
    accent2Rgb: [0.231, 0.509, 0.964],
    desc: 'Electric Blue & Ice',
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    shortName: 'Emerald',
    icon: '💎',
    color: '#34d399',
    secondaryColor: '#10b981',
    bgRgb: [0.011, 0.070, 0.047],
    accentRgb: [0.203, 0.827, 0.600],
    accent2Rgb: [0.062, 0.725, 0.505],
    desc: 'Mint & Deep Forest',
  },
  {
    id: 'amber',
    name: 'Solar Amber',
    shortName: 'Amber',
    icon: '👑',
    color: '#fbbf24',
    secondaryColor: '#f97316',
    bgRgb: [0.054, 0.035, 0.015],
    accentRgb: [0.984, 0.749, 0.141],
    accent2Rgb: [0.976, 0.450, 0.086],
    desc: 'Gold & Sunset Bronze',
  },
  {
    id: 'crimson',
    name: 'Crimson Velvet',
    shortName: 'Crimson',
    icon: '🔥',
    color: '#fb7185',
    secondaryColor: '#f43f5e',
    bgRgb: [0.070, 0.015, 0.031],
    accentRgb: [0.984, 0.443, 0.521],
    accent2Rgb: [0.956, 0.247, 0.368],
    desc: 'Ruby & Rose Velvet',
  },
];

