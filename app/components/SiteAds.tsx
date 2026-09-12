'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';
import { isAdminRoute } from '@/lib/is-admin-route';
import AdsterraPopunderManager from './AdsterraPopunderManager';

/**
 * SiteAds — Master Controller for all network and display advertisements.
 * Ensures strict compliance with advertising policies and pristine UX:
 * 1. ADS ARE NEVER LOADED OR RENDERED ON ANY ADMIN PANEL ROUTE.
 * 2. If navigating to an admin route from a public page, cleans up any existing ad elements.
 */
export default function SiteAds() {
  const pathname = usePathname();
  const isAdmin = isAdminRoute(pathname);

  useEffect(() => {
    if (isAdmin) {
      // Purge any lingering ad containers or iframes if transitioning to admin panel
      const selectors = [
        '#adsterra-social-bar',
        '#adsterra-popunder-dynamic',
        'script[src*="profitableratecpmnetwork.com"]',
        'script[src*="bibleearthquake.com"]',
        'script[src*="pagead2.googlesyndication.com"]',
        'ins.adsbygoogle',
        'iframe[id^="aswift_"]',
        'iframe[id^="google_ads_"]',
        'div[id^="google_ads_"]',
        '.adsbygoogle',
      ];
      selectors.forEach(sel => {
        try {
          const els = document.querySelectorAll(sel);
          els.forEach(el => el.remove());
        } catch {
          // ignore
        }
      });
    }
  }, [isAdmin]);

  if (isAdmin) {
    return null;
  }

  return (
    <>
      {/* AdSense Auto Ads */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1348117799300846"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      {/* Adsterra Social Bar */}
      <Script
        id="adsterra-social-bar"
        src="https://pl31253047.profitableratecpmnetwork.com/cf/09/69/cf09691eee1a394e996784f3aa7b4021.js"
        strategy="afterInteractive"
      />

      {/* Adsterra Anti-AdBlock Popunder with 40s Reset Frequency Manager */}
      <AdsterraPopunderManager />
    </>
  );
}
