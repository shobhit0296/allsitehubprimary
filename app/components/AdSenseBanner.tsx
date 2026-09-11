'use client';

import { useEffect, useRef } from 'react';

interface AdSenseBannerProps {
  client?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AdSenseBanner — Renders Google AdSense in exact designated positions.
 * Safely handles Next.js hydration, prevents duplicate push errors,
 * and maintains layout stability (min-height) to prevent layout shifts.
 */
export default function AdSenseBanner({
  client = 'ca-pub-1348117799300846',
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  style,
}: AdSenseBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    try {
      const el = adRef.current;
      if (el && !el.getAttribute('data-adsbygoogle-status')) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {
      // Gracefully handle ad-blockers and repeated fast-refresh calls
    }
  }, []);

  return (
    <div
      className={`w-full max-w-[1600px] mx-auto my-3 sm:my-5 px-3 sm:px-5 md:px-8 lg:px-10 xl:px-16 flex flex-col items-center justify-center ${className}`}
      aria-label="Advertisement"
    >
      <div className="w-full flex items-center justify-between mb-1.5 px-1">
        <span className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-white/30">
          Advertisement
        </span>
      </div>
      <div className="w-full flex justify-center items-center min-h-[90px] sm:min-h-[105px] rounded-2xl bg-white/[0.02] border border-white/[0.06] p-2 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '90px', ...style }}
          data-ad-client={client}
          {...(slot ? { 'data-ad-slot': slot } : {})}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
}
