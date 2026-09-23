import { readDB } from '@/lib/db';
import { CATEGORIES, REGIONS } from '@/lib/data';
import AllsitehubApp from './components/TBCPLApp';

export const revalidate = 300; // ISR: 5-minute edge cache, instant on-demand revalidation via writeDB

export default async function Home() {
  const db = await readDB();
  return (
    <AllsitehubApp
      sites={db.sites}
      categories={CATEGORIES}
      regions={REGIONS}
    />
  );
}
