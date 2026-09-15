'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isAdminRoute } from '@/lib/is-admin-route';

/**
 * SiteAds — Master Controller for all network and display advertisements.
 * Ensures strict compliance with advertising policies and pristine UX:
 * 1. ADS ARE NEVER LOADED OR RENDERED ON ANY ADMIN PANEL ROUTE.
 * 2. Pop-up ads, social bars, and aggressive popunders are PERMANENTLY REMOVED.
 * 3. Cleans up any lingering pop-up or ad elements.
 */
export default function SiteAds() {
  const pathname = usePathname();
  const isAdmin = isAdminRoute(pathname);

  useEffect(() => {
    // 1. Always purge pop-up ads, social bars, and popunders site-wide
    const popupSelectors = [
      '#adsterra-social-bar',
      '#adsterra-popunder-dynamic',
      'script[src*="af43a8a497a35fa461a277ea55d8898a"]',
      '[id*="adsterra-social-bar"]',
      '[class*="adsterra-social-bar"]',
      'div[class*="inpage-push"]',
      'div[id*="inpage-push"]',
    ];

    popupSelectors.forEach(sel => {
      try {
        const els = document.querySelectorAll(sel);
        els.forEach(el => el.remove());
      } catch {
        // ignore
      }
    });

    // 2. If on admin route, purge ALL ad networks, banners, and iframes
    if (isAdmin) {
      const adminPurgeSelectors = [
        'script[src*="profitableratecpmnetwork.com"]',
        'script[src*="bibleearthquake.com"]',
        'script[src*="pagead2.googlesyndication.com"]',
        'script[src*="highcpmgate.com"]',
        'ins.adsbygoogle',
        'iframe[id^="aswift_"]',
        'iframe[id^="google_ads_"]',
        'div[id^="google_ads_"]',
        'div[id^="container-36a34e7c2d7095493196dd10bc56ad23"]',
        '.google-auto-placed',
        '.adsbygoogle',
      ];
      adminPurgeSelectors.forEach(sel => {
        try {
          const els = document.querySelectorAll(sel);
          els.forEach(el => el.remove());
        } catch {
          // ignore
        }
      });
    }
  }, [isAdmin, pathname]);

  // Pop-up ads & admin ads are completely suppressed
  return null;
}
