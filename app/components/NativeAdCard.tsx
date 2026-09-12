'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isAdminRoute } from '@/lib/is-admin-route';

const SCRIPT_SRC = 'https://bibleearthquake.com/36a34e7c2d7095493196dd10bc56ad23/invoke.js';
const CONTAINER_ID = 'container-36a34e7c2d7095493196dd10bc56ad23';

/**
 * NativeAdCard — Renders Adsterra Native Banner as a card inside .sites-grid
 * Never renders on admin panel.
 */
export default function NativeAdCard() {
  const pathname = usePathname();
  const isAdmin = isAdminRoute(pathname);

  useEffect(() => {
    if (isAdmin) return;
    let script = document.querySelector(`script[src="${SCRIPT_SRC}"]`) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      document.body.appendChild(script);
    } else {
      // Re-trigger if container was mounted
      const container = document.getElementById(CONTAINER_ID);
      if (container && container.childNodes.length === 0) {
        window.dispatchEvent(new Event('popstate'));
      }
    }
  }, [isAdmin]);

  if (isAdmin) return null;

  return (
    <div
      className="sc-card sc-card--native-ad relative overflow-hidden flex flex-col justify-between"
      style={{
        minHeight: '122px',
      }}
    >
      {/* ── Row 1: SPONSORED badge ── */}
      <div className="sc-toprow w-full flex items-center justify-between mb-1 z-10">
        <span
          className="sc-badge"
          style={{
            color: '#f59e0b',
            borderColor: 'rgba(245,158,11,0.4)',
            background: 'rgba(245,158,11,0.08)',
          }}
        >
          SPONSORED
        </span>
        <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono">Ad</span>
      </div>

      {/* ── Row 2: Adsterra Native Ad Container ── */}
      <div
        id={CONTAINER_ID}
        className="w-full flex-1 flex items-center justify-center min-h-[75px] overflow-hidden"
      />

      {/* ── Row 3: Discreet Partner label ── */}
      <div className="sc-domain flex items-center gap-1.5 text-[10px] text-white/40 mt-1">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        <span>Recommended</span>
      </div>
    </div>
  );
}
