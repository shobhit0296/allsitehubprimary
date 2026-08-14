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
