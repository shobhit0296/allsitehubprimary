import { readDB } from '@/lib/db';
import { CATEGORIES, REGIONS } from '@/lib/data';
import AllsitehubApp from './components/TBCPLApp';

export const revalidate = 86400; // 24 hours — prevents continuous edge ISR writes (was 14k writes!)

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
