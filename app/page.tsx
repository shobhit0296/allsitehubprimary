import { readDB } from '@/lib/db';
import { CATEGORIES, REGIONS, type Category } from '@/lib/data';
import AllsitehubApp from './components/TBCPLApp';

export const revalidate = 60;

export default async function Home() {
  const db = await readDB();
  const categoryMap = new Map(CATEGORIES.map(c => [c.name.toLowerCase(), c]));
  const categories: Category[] = (db.categories || []).map(name => {
    const existing = categoryMap.get(name.toLowerCase());
    if (existing) return existing;
    return { name, icon: '🌐', description: `Explore curated ${name} websites on AllSiteHub.` };
  });

  return (
    <AllsitehubApp
      sites={db.sites}
      categories={categories.length > 0 ? categories : CATEGORIES}
      regions={REGIONS}
    />
  );
}
