import { notFound } from 'next/navigation';
import { isPanelSegment } from '@/lib/admin-auth';
import AdminLoginForm from '../components/AdminLoginForm';

export const dynamic = 'force-dynamic';

export default async function PanelLoginPage({ params }: { params: Promise<{ panel: string }> }) {
  const { panel } = await params;
  if (!isPanelSegment(panel)) notFound();

  return <AdminLoginForm panel={panel} />;
}
