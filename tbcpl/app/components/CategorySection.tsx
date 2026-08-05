import type { Site, Category } from '@/lib/data';
import SiteCard from './SiteCard';

interface CategorySectionProps {
  category: Category;
  sites: Site[];
  bookmarks: Set<string>;
  onToggleBookmark: (id: string) => void;
}

const ACCENT_COLORS: Record<string, string> = {
  'Movies & Shows':   '#8b5cf6',
  'Anime':            '#3b82f6',
  'Manga':            '#f59e0b',
  'Live TV & Sports': '#10b981',
  'Paid':             '#f43f5e',
  'Apps':             '#06b6d4',
};

export default function CategorySection({ category, sites, bookmarks, onToggleBookmark }: CategorySectionProps) {
  if (sites.length === 0) return null;

  const accent = ACCENT_COLORS[category.name] ?? '#3b82f6';

  return (
    <section className="mb-12 fade-up">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <div
            className="w-[3px] h-9 rounded-sm shrink-0"
            style={{ background: accent, boxShadow: `0 0 12px ${accent}55` }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{category.icon}</span>
              <h2 className="font-headline text-lg font-bold tracking-tight text-[var(--text-primary)]">{category.name}</h2>
              <span
                className="text-[11px] font-bold rounded-md px-2 py-0.5"
                style={{ color: accent, background: `${accent}18`, border: `1px solid ${accent}30` }}
              >
                {sites.length}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{category.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sites.map(site => (
          <SiteCard
            key={site.id}
            site={site}
            isBookmarked={bookmarks.has(site.id)}
            onToggleBookmark={onToggleBookmark}
          />
        ))}
      </div>
    </section>
  );
}
