import { readDB } from '@/lib/db';
import { CATEGORIES, REGIONS } from '@/lib/data';
import AllsitehubApp from './components/TBCPLApp';

export const revalidate = 60; // 60s background ISR revalidation

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
