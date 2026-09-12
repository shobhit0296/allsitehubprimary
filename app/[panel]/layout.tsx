import type { Metadata } from 'next';
import AdminAdSuppressor from './components/AdminAdSuppressor';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-admin-panel="true" className="w-full flex-1 flex flex-col min-h-screen relative">
      <AdminAdSuppressor />
      {children}
    </div>
  );
}
