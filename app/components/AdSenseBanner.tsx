'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { isAdminRoute } from '@/lib/is-admin-route';

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
 * Never renders on admin panel.
 */
export default function AdSenseBanner({
  client = 'ca-pub-1348117799300846',
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  style,
}: AdSenseBannerProps) {
  const pathname = usePathname();
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    if (isAdminRoute(pathname)) return;
    try {
      const el = adRef.current;
      if (el && !el.getAttribute('data-adsbygoogle-status')) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {
      // Gracefully handle ad-blockers and repeated fast-refresh calls
    }
  }, [pathname]);

  if (isAdminRoute(pathname)) return null;

  return (
    <div
      className={`w-full max-w-[1600px] mx-auto my-4 sm:my-6 px-3 sm:px-5 md:px-8 lg:px-10 xl:px-16 flex flex-col items-center justify-center ${className}`}
      aria-label="Advertisement"
    >
      <div className="w-full flex items-center justify-between mb-1.5 px-1 max-w-[1280px]">
        <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-[var(--text-muted)] opacity-60">
          Advertisement
        </span>
      </div>
      <div className="w-full max-w-[1280px] flex justify-center items-center min-h-[90px] sm:min-h-[105px] rounded-2xl bg-white/[0.02] border border-white/[0.08] p-2 overflow-hidden shadow-sm">
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
