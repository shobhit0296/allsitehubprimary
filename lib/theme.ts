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
  vars: Record<string, string>;
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
    vars: {
      '--bg-base': '#0a0a12',
      '--bg-surface': '#111118',
      '--bg-card': 'rgba(28,28,40,0.55)',
      '--bg-card-hover': 'rgba(36,36,52,0.72)',
      '--border': 'rgba(255,255,255,0.09)',
      '--border-accent': 'rgba(208,188,255,0.55)',
      '--primary': '#c4b5fd',
      '--secondary': '#67e8f9',
      '--text-primary': '#ece9f4',
      '--text-secondary': '#a8a3bb',
      '--text-muted': '#635f75',
      '--text-accent': '#c4b5fd',
      '--glow': 'rgba(196,181,253,0.3)',
      '--gradient': 'linear-gradient(135deg, #c4b5fd, #67e8f9)',
      '--gradient-text': 'linear-gradient(90deg, #c4b5fd 0%, #818cf8 40%, #67e8f9 100%)',
    },
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
    vars: {
      '--bg-base': '#060814',
      '--bg-surface': '#0c1024',
      '--bg-card': 'rgba(12, 18, 42, 0.65)',
      '--bg-card-hover': 'rgba(18, 28, 62, 0.82)',
      '--border': 'rgba(0, 240, 255, 0.2)',
      '--border-accent': 'rgba(255, 0, 128, 0.75)',
      '--primary': '#00f0ff',
      '--secondary': '#ff007f',
      '--text-primary': '#f0fdf4',
      '--text-secondary': '#94a3b8',
      '--text-muted': '#64748b',
      '--text-accent': '#00f0ff',
      '--glow': 'rgba(0, 240, 255, 0.35)',
      '--gradient': 'linear-gradient(135deg, #00f0ff, #ff007f)',
      '--gradient-text': 'linear-gradient(90deg, #00f0ff 0%, #d946ef 50%, #ff007f 100%)',
    },
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
    vars: {
      '--bg-base': '#040c18',
      '--bg-surface': '#08172e',
      '--bg-card': 'rgba(8, 24, 48, 0.62)',
      '--bg-card-hover': 'rgba(14, 38, 72, 0.78)',
      '--border': 'rgba(56, 189, 248, 0.18)',
      '--border-accent': 'rgba(59, 130, 246, 0.75)',
      '--primary': '#38bdf8',
      '--secondary': '#3b82f6',
      '--text-primary': '#f0f9ff',
      '--text-secondary': '#93c5fd',
      '--text-muted': '#475569',
      '--text-accent': '#38bdf8',
      '--glow': 'rgba(56, 189, 248, 0.32)',
      '--gradient': 'linear-gradient(135deg, #38bdf8, #3b82f6)',
      '--gradient-text': 'linear-gradient(90deg, #38bdf8 0%, #60a5fa 50%, #818cf8 100%)',
    },
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
    vars: {
      '--bg-base': '#03120c',
      '--bg-surface': '#061e14',
      '--bg-card': 'rgba(6, 32, 22, 0.62)',
      '--bg-card-hover': 'rgba(10, 48, 34, 0.78)',
      '--border': 'rgba(16, 185, 129, 0.18)',
      '--border-accent': 'rgba(52, 211, 153, 0.75)',
      '--primary': '#34d399',
      '--secondary': '#10b981',
      '--text-primary': '#ecfdf5',
      '--text-secondary': '#a7f3d0',
      '--text-muted': '#47695c',
      '--text-accent': '#34d399',
      '--glow': 'rgba(52, 211, 153, 0.32)',
      '--gradient': 'linear-gradient(135deg, #34d399, #10b981)',
      '--gradient-text': 'linear-gradient(90deg, #6ee7b7 0%, #34d399 50%, #10b981 100%)',
    },
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
    vars: {
      '--bg-base': '#0e0904',
      '--bg-surface': '#1a1106',
      '--bg-card': 'rgba(32, 20, 8, 0.62)',
      '--bg-card-hover': 'rgba(48, 30, 12, 0.78)',
      '--border': 'rgba(245, 158, 11, 0.18)',
      '--border-accent': 'rgba(251, 191, 36, 0.75)',
      '--primary': '#fbbf24',
      '--secondary': '#f97316',
      '--text-primary': '#fffbeb',
      '--text-secondary': '#fde68a',
      '--text-muted': '#7c5e38',
      '--text-accent': '#fbbf24',
      '--glow': 'rgba(251, 191, 36, 0.32)',
      '--gradient': 'linear-gradient(135deg, #fbbf24, #f97316)',
      '--gradient-text': 'linear-gradient(90deg, #fde68a 0%, #fbbf24 50%, #f97316 100%)',
    },
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
    vars: {
      '--bg-base': '#120408',
      '--bg-surface': '#200810',
      '--bg-card': 'rgba(36, 8, 18, 0.62)',
      '--bg-card-hover': 'rgba(54, 12, 28, 0.78)',
      '--border': 'rgba(244, 63, 94, 0.18)',
      '--border-accent': 'rgba(251, 113, 133, 0.75)',
      '--primary': '#fb7185',
      '--secondary': '#f43f5e',
      '--text-primary': '#fff1f2',
      '--text-secondary': '#fecdd3',
      '--text-muted': '#824855',
      '--text-accent': '#fb7185',
      '--glow': 'rgba(251, 113, 133, 0.32)',
      '--gradient': 'linear-gradient(135deg, #fb7185, #e11d48)',
      '--gradient-text': 'linear-gradient(90deg, #fecdd3 0%, #fb7185 50%, #e11d48 100%)',
    },
    desc: 'Ruby & Rose Velvet',
  },
];

export function applyThemeGlobal(themeId: string) {
  if (typeof document === 'undefined') return;
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  try {
    document.documentElement.setAttribute('data-theme', theme.id);
    if (document.body) {
      document.body.setAttribute('data-theme', theme.id);
      document.body.style.backgroundColor = theme.vars['--bg-base'] || '#0a0a12';
    }

    // Set inline CSS variables for instant 0ms guarantee
    const root = document.documentElement;
    if (theme.vars) {
      for (const [key, value] of Object.entries(theme.vars)) {
        root.style.setProperty(key, value);
      }
    }

    localStorage.setItem('allSiteHub_theme', theme.id);
    window.dispatchEvent(new CustomEvent('allSiteHub_theme_changed', { detail: theme.id }));
  } catch {
    // ignore
  }
}
