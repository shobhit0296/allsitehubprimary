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
    name: 'Cosmic Dark',
    shortName: 'Cosmic',
    icon: '✦',
    color: '#a78bfa',
    secondaryColor: '#38bdf8',
    bgRgb: [0.02, 0.02, 0.045],
    accentRgb: [0.655, 0.545, 0.98],
    accent2Rgb: [0.22, 0.74, 0.97],
    vars: {
      '--bg-base': '#05050a',
      '--bg-surface': '#0b0b14',
      '--bg-card': 'rgba(14, 14, 24, 0.65)',
      '--bg-card-hover': 'rgba(22, 22, 38, 0.85)',
      '--border': 'rgba(255, 255, 255, 0.08)',
      '--border-accent': 'rgba(167, 139, 250, 0.65)',
      '--primary': '#a78bfa',
      '--secondary': '#38bdf8',
      '--text-primary': '#f8fafc',
      '--text-secondary': '#94a3b8',
      '--text-muted': '#64748b',
      '--text-accent': '#a78bfa',
      '--glow': 'rgba(167, 139, 250, 0.28)',
      '--gradient': 'linear-gradient(135deg, #a78bfa, #38bdf8)',
      '--gradient-text': 'linear-gradient(90deg, #c4b5fd 0%, #a78bfa 50%, #38bdf8 100%)',
    },
    desc: 'Obsidian & Royal Violet',
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
    desc: 'Synth Cyan & Electric Pink',
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
    desc: 'Sapphire Blue & Glacial Ice',
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
    desc: 'Mint Cyber & Deep Jade',
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
    desc: 'Imperial Gold & Amber Sunset',
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
    desc: 'Ruby Red & Rose Velvet',
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    shortName: 'Aurora',
    icon: '🌌',
    color: '#2dd4bf',
    secondaryColor: '#818cf8',
    bgRgb: [0.012, 0.043, 0.078],
    accentRgb: [0.176, 0.831, 0.749],
    accent2Rgb: [0.505, 0.549, 0.972],
    vars: {
      '--bg-base': '#030b14',
      '--bg-surface': '#061726',
      '--bg-card': 'rgba(6, 26, 44, 0.65)',
      '--bg-card-hover': 'rgba(10, 38, 64, 0.82)',
      '--border': 'rgba(45, 212, 191, 0.18)',
      '--border-accent': 'rgba(129, 140, 248, 0.75)',
      '--primary': '#2dd4bf',
      '--secondary': '#818cf8',
      '--text-primary': '#f0fdfa',
      '--text-secondary': '#99f6e4',
      '--text-muted': '#4a7572',
      '--text-accent': '#2dd4bf',
      '--glow': 'rgba(45, 212, 191, 0.32)',
      '--gradient': 'linear-gradient(135deg, #2dd4bf, #818cf8)',
      '--gradient-text': 'linear-gradient(90deg, #5eead4 0%, #2dd4bf 50%, #818cf8 100%)',
    },
    desc: 'Arctic Teal & Indigo Nebula',
  },
  {
    id: 'stealth',
    name: 'Stealth Onyx',
    shortName: 'Stealth',
    icon: '🖤',
    color: '#e2e8f0',
    secondaryColor: '#94a3b8',
    bgRgb: [0.031, 0.031, 0.039],
    accentRgb: [0.886, 0.910, 0.941],
    accent2Rgb: [0.580, 0.639, 0.722],
    vars: {
      '--bg-base': '#08080a',
      '--bg-surface': '#101014',
      '--bg-card': 'rgba(20, 20, 26, 0.65)',
      '--bg-card-hover': 'rgba(30, 30, 40, 0.85)',
      '--border': 'rgba(255, 255, 255, 0.12)',
      '--border-accent': 'rgba(226, 232, 240, 0.8)',
      '--primary': '#e2e8f0',
      '--secondary': '#94a3b8',
      '--text-primary': '#ffffff',
      '--text-secondary': '#cbd5e1',
      '--text-muted': '#64748b',
      '--text-accent': '#e2e8f0',
      '--glow': 'rgba(226, 232, 240, 0.22)',
      '--gradient': 'linear-gradient(135deg, #f8fafc, #94a3b8)',
      '--gradient-text': 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)',
    },
    desc: 'Titanium & Stealth Obsidian',
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
