import type { Site, Category } from '@/lib/data';
import { categoryAccent } from '@/lib/theme';
import SiteCard from './SiteCard';
import CategoryIcon from './CategoryIcon';

interface CategorySectionProps {
  category: Category;
  sites: Site[];
  bookmarks: Set<string>;
  onToggleBookmark: (id: string) => void;
}

export default function CategorySection({ category, sites, bookmarks, onToggleBookmark }: CategorySectionProps) {
  if (sites.length === 0) return null;

  const accent = categoryAccent(category.name);

  return (
    <section
      id={`cat-${category.name.replace(/\s+/g, '-').replace(/&/g, 'and').toLowerCase()}`}
      className="mb-12 sm:mb-16 fade-up scroll-mt-24"
    >
      {/* ── Section Header ─────────────────────────── */}
      <div className="flex items-end justify-between mb-4 sm:mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3 sm:gap-4 group">
          {/* Glowing accent bar */}
          <div
            className="w-[3.5px] sm:w-[4px] h-9 sm:h-12 rounded-full shrink-0 transition-all duration-300 group-hover:scale-y-110"
            style={{
              background: `linear-gradient(180deg, ${accent}, ${accent}44)`,
              boxShadow: `0 0 18px ${accent}66`,
            }}
          />
          <div>
            <div className="flex items-center gap-2 sm:gap-2.5 mb-0.5 sm:mb-1.5">
              <CategoryIcon name={category.name} size={24} className="shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <h2 className="font-headline text-[1.15rem] sm:text-2xl font-bold tracking-[-0.02em] text-[var(--text-primary)]">
                {category.name}
              </h2>
              <span
                className="text-[10.5px] sm:text-[11px] font-bold rounded-md px-2 py-0.5 tabular-nums transition-all duration-300"
                style={{ color: accent, background: `${accent}1a`, border: `1px solid ${accent}38` }}
              >
                {sites.length}
              </span>
            </div>
            <p className="text-[12px] sm:text-[13.5px] text-[var(--text-muted)] leading-snug line-clamp-1 sm:line-clamp-none">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── Sites Grid: 2 on phone, 3 on tablet, 4-6 on desktop ──────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-3.5 md:gap-4 w-full">
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
