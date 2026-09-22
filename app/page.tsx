import { readDB } from '@/lib/db';
import { CATEGORIES, REGIONS } from '@/lib/data';
import AllsitehubApp from './components/TBCPLApp';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
