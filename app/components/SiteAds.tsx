'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isAdminRoute } from '@/lib/is-admin-route';

import Script from 'next/script';
import AdsterraPopunderManager from './AdsterraPopunderManager';

/**
 * SiteAds — Master Controller for all network and display advertisements.
 * 1. ADS ARE NEVER LOADED OR RENDERED ON ANY ADMIN PANEL ROUTE.
 * 2. Redirection ads (Popunder) and Google AdSense are active on public website routes.
 * 3. Pop-up notification boxes and floating social bars are suppressed for a clean UI.
 */
export default function SiteAds() {
  const pathname = usePathname();
  const isAdmin = isAdminRoute(pathname);

  useEffect(() => {
    // 1. Purge annoying floating in-page push / social bar notification boxes
    const floatingBarSelectors = [
      '#adsterra-social-bar',
      '[id*="adsterra-social-bar"]',
      '[class*="adsterra-social-bar"]',
      'div[class*="inpage-push"]',
      'div[id*="inpage-push"]',
    ];

    floatingBarSelectors.forEach(sel => {
      try {
        const els = document.querySelectorAll(sel);
        els.forEach(el => el.remove());
      } catch {
        // ignore
      }
    });

    // 2. If on admin route, purge ALL ad networks, banners, redirection scripts, and iframes
    if (isAdmin) {
      const adminPurgeSelectors = [
        '#adsterra-popunder-dynamic',
        'script[src*="af43a8a497a35fa461a277ea55d8898a"]',
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

  if (isAdmin) {
    return null;
  }

  return (
    <>
      {/* Google AdSense Auto Ads */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1348117799300846"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      {/* Redirection / Popunder Ads */}
      <AdsterraPopunderManager />
    </>
  );
}
