'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isAdminRoute } from '@/lib/is-admin-route';

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
    // 1. Purge annoying floating in-page push, social bars, and injected ad-intent chips ("Watch Premium Videos", etc.)
    const inlineAdChipSelectors = [
      '#adsterra-social-bar',
      '[id*="adsterra-social-bar"]',
      '[class*="adsterra-social-bar"]',
      'div[class*="inpage-push"]',
      'div[id*="inpage-push"]',
      '.google-anno-term',
      '.google-anno-chip',
      '[class*="google-anno"]',
      '[id*="google-anno"]',
      '[data-google-ad-intent]',
      '[data-google-anno]',
      'a[data-google-ad-intent]',
      'a[data-google-query-id]',
      'a[data-google-interstitial]',
    ];

    function purgeChips() {
      inlineAdChipSelectors.forEach(sel => {
        try {
          const els = document.querySelectorAll(sel);
          els.forEach(el => el.remove());
        } catch {
          // ignore
        }
      });
    }

    purgeChips();

    // Observe asynchronous injections from AdSense Auto Ads
    let observer: MutationObserver | null = null;
    try {
      observer = new MutationObserver(() => {
        purgeChips();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    } catch {
      // ignore
    }

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

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isAdmin, pathname]);

  if (isAdmin) {
    return null;
  }

  return null;
}
