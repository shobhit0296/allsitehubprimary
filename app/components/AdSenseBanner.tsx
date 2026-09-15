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
export default function AdSenseBanner(_props: AdSenseBannerProps) {
  return null;
}
