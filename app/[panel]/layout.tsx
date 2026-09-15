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
      <script
        dangerouslySetInnerHTML={{
          __html: `try{document.documentElement.setAttribute('data-admin-panel','true');document.body&&document.body.classList.add('is-admin-route');window.__IS_ADMIN_PANEL=true;window.ppc=1;}catch(e){}`,
        }}
      />
      <AdminAdSuppressor />
      {children}
    </div>
  );
}
