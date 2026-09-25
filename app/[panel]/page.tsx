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
  const allCategories = Array.from(
    new Set([
      ...CATEGORIES.map(c => c.name),
      ...(Array.isArray(db.categories) ? db.categories : []),
      ...db.sites.map(s => s.category).filter(Boolean),
    ])
  );

  return (
    <AdminDashboard
      panel={panel}
      initialSites={db.sites}
      initialRequests={db.requests ?? []}
      categories={allCategories}
      regions={REGIONS}
    />
  );
}
