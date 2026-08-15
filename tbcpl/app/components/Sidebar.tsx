'use client';

import type { Category } from '@/lib/data';
import ThemeDragToggle from './ThemeDragToggle';

interface SidebarProps {
  categories: Category[];
  categoryCounts: Record<string, number>;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

const ACCENT_COLORS: Record<string, string> = {
  'Movies & Shows':   '#8b5cf6',
  'Anime':            '#3b82f6',
  'Manga':            '#f59e0b',
  'Live TV & Sports': '#10b981',
  'Paid':             '#f43f5e',
  'Apps':             '#06b6d4',
};

export default function Sidebar({ categories, categoryCounts, activeCategory, onCategoryChange }: SidebarProps) {
  const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Categories */}
      <div>
        <h4 className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-[var(--text-muted)] mb-3 flex items-center gap-2">
          <span className="w-3 h-px bg-blue-500/60 inline-block" />
          Categories
        </h4>
        <div className="glass-lux border border-white/10 rounded-2xl p-1.5 flex flex-col gap-0.5">
          <CatItem
            icon="✦"
            name="All Sites"
            count={totalCount}
            accent="#3b82f6"
            isActive={activeCategory === 'all'}
            onClick={() => onCategoryChange('all')}
          />
          {categories.map(cat => (
            <CatItem
              key={cat.name}
              icon={cat.icon}
              name={cat.name}
              count={categoryCounts[cat.name] ?? 0}
              accent={ACCENT_COLORS[cat.name] ?? '#3b82f6'}
              isActive={activeCategory === cat.name}
              onClick={() => onCategoryChange(activeCategory === cat.name ? 'all' : cat.name)}
            />
          ))}
        </div>
      </div>

      {/* Community logo-only links (Seamlessly merged with background) */}
      <div className="pt-0.5">
        <div className="grid grid-cols-2 gap-2">
          {/* Discord Logo Button */}
          <a
            href="https://discord.gg/EDH5ScSsv"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
            title="Discord Server"
            className="flex items-center justify-center h-10 rounded-xl bg-white/[0.025] hover:bg-[#5865F2]/15 border border-white/[0.06] hover:border-[#5865F2]/45 text-[#5865F2] hover:text-white transition-all duration-200 group shadow-sm hover:shadow-[0_0_16px_rgba(88,101,242,0.25)] active:scale-95"
          >
            <span className="transition-transform duration-200 group-hover:scale-110">
              <DiscordIcon />
            </span>
          </a>

          {/* Reddit Logo Button */}
          <a
            href="https://www.reddit.com/user/Ill_Committee7612/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Reddit"
            title="Reddit Community"
            className="flex items-center justify-center h-10 rounded-xl bg-white/[0.025] hover:bg-[#FF4500]/15 border border-white/[0.06] hover:border-[#FF4500]/45 text-[#FF4500] hover:text-white transition-all duration-200 group shadow-sm hover:shadow-[0_0_16px_rgba(255,69,0,0.25)] active:scale-95"
          >
            <span className="transition-transform duration-200 group-hover:scale-110">
              <RedditIcon />
            </span>
          </a>
        </div>
      </div>

      <p className="text-[var(--text-muted)] text-[11px] leading-relaxed px-1">
        Allsitehub curates the best streaming sites for entertainment. We don&apos;t host any content.
      </p>
    </div>
  );
}

function CatItem({
  icon, name, count, accent, isActive, onClick,
}: { icon: string; name: string; count: number; accent: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left transition-all duration-150 group"
      style={{
        background: isActive ? `${accent}14` : 'transparent',
        boxShadow: isActive ? `inset 3px 0 0 0 ${accent}` : undefined,
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[15px] shrink-0 transition-transform group-hover:scale-105"
        style={{
          background: isActive ? `${accent}22` : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isActive ? `${accent}50` : 'rgba(255,255,255,0.07)'}`,
        }}
      >
        {icon}
      </span>
      <span className={`flex-1 text-[13px] truncate ${isActive ? 'font-semibold text-[var(--text-primary)]' : 'font-medium text-[var(--text-secondary)]'}`}>
        {name}
      </span>
      <span
        className="text-[10.5px] font-bold rounded-full px-2 py-0.5 shrink-0 tabular-nums"
        style={{
          color: isActive ? accent : 'var(--text-muted)',
          background: isActive ? `${accent}1c` : 'rgba(255,255,255,0.04)',
        }}
      >
        {count}
      </span>
    </button>
  );
}

function DiscordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.955 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z"/>
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.82 14.15c.036.244.055.492.055.744 0 3.019-3.517 5.47-7.856 5.47-4.34 0-7.857-2.451-7.857-5.47 0-.252.02-.5.055-.744-.542-.246-.92-.79-.92-1.424 0-.86.698-1.558 1.558-1.558.42 0 .8.166 1.08.437 1.062-.766 2.53-1.253 4.16-1.31l.848-3.99a.32.32 0 0 1 .38-.246l2.813.598a1.076 1.076 0 1 1-.086.512l-2.518-.535-.756 3.556c1.61.065 3.056.552 4.11 1.31.28-.27.66-.437 1.08-.437.86 0 1.558.698 1.558 1.558 0 .636-.38 1.183-.926 1.428zM8.16 14.06c-.68 0-1.24-.55-1.24-1.235 0-.686.56-1.246 1.24-1.246.686 0 1.245.56 1.245 1.246 0 .686-.56 1.235-1.245 1.235zm7.68 0c-.68 0-1.24-.55-1.24-1.235 0-.686.56-1.246 1.24-1.246.686 0 1.245.56 1.245 1.246 0 .686-.56 1.235-1.245 1.235zm-6.1 2.02c-.15-.15-.15-.393 0-.543a.386.386 0 0 1 .543 0c.686.686 2.033.75 2.42.75.386 0 1.75-.064 2.42-.75a.386.386 0 0 1 .543 0c.15.15.15.393 0 .543-.75.75-2.11.943-2.963.943-.85 0-2.21-.193-2.963-.943z"/>
    </svg>
  );
}
