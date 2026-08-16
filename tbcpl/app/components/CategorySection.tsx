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
      className="mb-10 sm:mb-16 fade-up scroll-mt-28 sm:scroll-mt-32 xl:scroll-mt-24 transform-gpu"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 320px' }}
    >
      {/* ── Section Header ─────────────────────────── */}
      <div className="flex items-end justify-between mb-5 sm:mb-7 flex-wrap gap-3">
        <div className="flex items-center gap-3.5 sm:gap-4.5 group">
          {/* Glowing accent bar */}
          <div
            className="w-[4px] sm:w-[4.5px] h-10 sm:h-13 rounded-full shrink-0 transition-all duration-300 group-hover:scale-y-110"
            style={{
              background: `linear-gradient(180deg, ${accent}, ${accent}44)`,
              boxShadow: `0 0 18px ${accent}66`,
            }}
          />
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3 mb-0.5 sm:mb-1.5">
              <CategoryIcon name={category.name} size={26} className="shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <h2 className="font-headline text-[1.25rem] sm:text-[1.65rem] font-bold tracking-[-0.02em] text-[var(--text-primary)]">
                {category.name}
              </h2>
              <span
                className="text-[11px] sm:text-[12px] font-bold rounded-md px-2.5 py-0.5 tabular-nums transition-all duration-300"
                style={{ color: accent, background: `${accent}1a`, border: `1px solid ${accent}38` }}
              >
                {sites.length}
              </span>
            </div>
            <p className="text-[13px] sm:text-[14.5px] text-[var(--text-muted)] leading-snug line-clamp-1 sm:line-clamp-none">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── Sites Grid: 2 on phone/small tablet, 3 on tablet/laptop, 4 on desktop ──────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-4.5 w-full">
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
