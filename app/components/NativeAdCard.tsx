'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isAdminRoute } from '@/lib/is-admin-route';

const SCRIPT_SRC = 'https://bibleearthquake.com/36a34e7c2d7095493196dd10bc56ad23/invoke.js';
const CONTAINER_ID = 'container-36a34e7c2d7095493196dd10bc56ad23';

/**
 * NativeAdCard — Renders Adsterra Native Banner inside .sites-grid
 * 
 * 1. Mount-guarded (useEffect) to guarantee 100% clean SSR hydration without mismatches.
 * 2. In development (localhost), renders a clean sponsored card preview.
 * 3. In production, renders in a strictly sandboxed iframe (no allow-same-origin).
 */
export default function NativeAdCard() {
  const pathname = usePathname();
  const isAdmin = isAdminRoute(pathname);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isAdmin) return null;

  const cardHeader = (
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
  );

  const cardFooter = (
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
  );

  if (!mounted) {
    return (
      <div
        className="sc-card sc-card--native-ad relative overflow-hidden flex flex-col justify-between"
        style={{ minHeight: '122px' }}
      >
        {cardHeader}
        <div className="w-full flex-1 flex items-center justify-center min-h-[75px]">
          <span className="text-[11px] text-white/20">Sponsored</span>
        </div>
        {cardFooter}
      </div>
    );
  }

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div
      className="sc-card sc-card--native-ad relative overflow-hidden flex flex-col justify-between"
      style={{ minHeight: '122px' }}
    >
      {cardHeader}

      <div className="w-full flex-1 flex items-center justify-center min-h-[75px] overflow-hidden">
        {isDev ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 rounded-lg border border-dashed border-amber-500/20 bg-amber-500/[0.02]">
            <span className="text-[11px] font-medium text-amber-300/80">Sponsored Partner</span>
            <span className="text-[9px] text-white/30">Active in Production</span>
          </div>
        ) : (
          <iframe
            srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><base target="_blank"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent;overflow:hidden;color:#fff;font-family:sans-serif}</style></head><body><script async data-cfasync="false" src="${SCRIPT_SRC}"><\/script><div id="${CONTAINER_ID}"></div></body></html>`}
            title="Sponsored Ad"
            className="w-full flex-1 border-0 overflow-hidden"
            style={{ minHeight: '75px', width: '100%' }}
            sandbox="allow-scripts allow-popups allow-forms"
            loading="lazy"
          />
        )}
      </div>

      {cardFooter}
    </div>
  );
}
