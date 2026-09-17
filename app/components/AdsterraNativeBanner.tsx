'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isAdminRoute } from '@/lib/is-admin-route';

const SCRIPT_SRC = 'https://bibleearthquake.com/36a34e7c2d7095493196dd10bc56ad23/invoke.js';
const CONTAINER_ID = 'container-36a34e7c2d7095493196dd10bc56ad23';

interface AdsterraNativeBannerProps {
  className?: string;
}

/**
 * AdsterraNativeBanner — Official Native Banner Widget
 * 
 * 1. Mount-guarded (useEffect) to guarantee 100% clean SSR hydration without mismatches.
 * 2. In development (localhost), renders a sleek placeholder so developers don't suffer
 *    from ERR_BLOCKED_BY_CLIENT, console clutter, or localhost script blocks.
 * 3. In production, renders in a strictly sandboxed iframe (no allow-same-origin)
 *    so third-party ad scripts can NEVER touch the host document.body or React fiber tree.
 */
export default function AdsterraNativeBanner({ className = '' }: AdsterraNativeBannerProps) {
  const pathname = usePathname();
  const isAdmin = isAdminRoute(pathname);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isAdmin) return null;

  // Header banner UI
  const bannerHeader = (
    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06] text-[11px] text-[var(--text-muted)] font-medium">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
        <span className="text-[10px] tracking-wider uppercase font-semibold text-amber-300/90">
          Sponsored Recommendations
        </span>
      </div>
      <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Ad</span>
    </div>
  );

  // Initial SSR & Hydration pass: render deterministic container to prevent hydration mismatches
  if (!mounted) {
    return (
      <div className={`w-full my-6 sm:my-8 px-1 sm:px-2 ${className}`}>
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-4 backdrop-blur-sm overflow-hidden shadow-lg min-h-[140px]">
          {bannerHeader}
          <div className="w-full min-h-[90px] flex items-center justify-center text-xs text-white/20">
            Loading recommendations...
          </div>
        </div>
      </div>
    );
  }

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className={`w-full my-6 sm:my-8 px-1 sm:px-2 ${className}`}>
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-4 backdrop-blur-sm overflow-hidden shadow-lg">
        {bannerHeader}

        <div className="w-full min-h-[100px] flex items-center justify-center overflow-hidden">
          {isDev ? (
            <div className="w-full py-6 px-4 rounded-xl border border-dashed border-amber-500/20 bg-amber-500/[0.03] flex flex-col items-center justify-center text-center gap-1">
              <span className="text-xs font-medium text-amber-300/80">Adsterra Native Ad Slot</span>
              <span className="text-[11px] text-white/40">Active in production. Suppressed in local development to prevent adblock errors.</span>
            </div>
          ) : (
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><base target="_blank"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent;overflow:hidden;color:#fff;font-family:sans-serif}</style></head><body><script async data-cfasync="false" src="${SCRIPT_SRC}"><\/script><div id="${CONTAINER_ID}"></div></body></html>`}
              title="Sponsored Recommendations"
              className="w-full border-0 overflow-hidden"
              style={{ minHeight: '140px', width: '100%' }}
              sandbox="allow-scripts allow-popups allow-forms"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </div>
  );
}
