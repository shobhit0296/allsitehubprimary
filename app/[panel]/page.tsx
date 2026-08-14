import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { readDB } from '@/lib/db';
import { CATEGORIES, REGIONS } from '@/lib/data';
import { ADMIN_COOKIE, isPanelSegment, verifySessionToken } from '@/lib/admin-auth';
import AdminDashboard from './components/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function PanelPage({ params }: { params: Promise<{ panel: string }> }) {
  const { panel } = await params;
  if (!isPanelSegment(panel)) notFound();

  const store = await cookies();
  if (!verifySessionToken(store.get(ADMIN_COOKIE)?.value)) redirect(`/${panel}/login`);

  const db = await readDB();
  return (
    <AdminDashboard
      panel={panel}
      initialSites={db.sites}
      initialRequests={db.requests ?? []}
      categories={CATEGORIES.map(c => c.name)}
      regions={REGIONS}
    />
  );
}
