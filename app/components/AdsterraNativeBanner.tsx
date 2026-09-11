'use client';

import { useEffect, useRef } from 'react';

const SCRIPT_SRC = 'https://bibleearthquake.com/36a34e7c2d7095493196dd10bc56ad23/invoke.js';
const CONTAINER_ID = 'container-36a34e7c2d7095493196dd10bc56ad23';

interface AdsterraNativeBannerProps {
  className?: string;
}

/**
 * AdsterraNativeBanner — Official Native Banner Widget
 * Injects Adsterra multi-card native ads with high CTR and CPM.
 */
export default function AdsterraNativeBanner({ className = '' }: AdsterraNativeBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if script is already added
    let script = document.querySelector(`script[src="${SCRIPT_SRC}"]`) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      document.body.appendChild(script);
    } else {
      // If script was already loaded, re-trigger invocation if container is empty
      const container = document.getElementById(CONTAINER_ID);
      if (container && container.childNodes.length === 0) {
        // Trigger a fake popstate/pushstate or script re-load so Adsterra populates the container
        window.dispatchEvent(new Event('popstate'));
      }
    }
  }, []);

  return (
    <div className={`w-full my-6 sm:my-8 px-1 sm:px-2 ${className}`}>
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-4 backdrop-blur-sm overflow-hidden shadow-lg">
        {/* Subtle sponsored header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06] text-[11px] text-[var(--text-muted)] font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
            <span className="text-[10px] tracking-wider uppercase font-semibold text-amber-300/90">
              Sponsored Recommendations
            </span>
          </div>
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Ad</span>
        </div>

        {/* Adsterra Native Container */}
        <div
          id={CONTAINER_ID}
          ref={containerRef}
          className="w-full min-h-[140px] flex items-center justify-center overflow-hidden"
        />
      </div>
    </div>
  );
}
