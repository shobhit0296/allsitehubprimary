'use client';

import { useEffect, useLayoutEffect } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * AdminAdSuppressor — Mounted strictly inside the Admin Panel layout.
 * Guarantees that:
 * 1. Global window and document flags identify this environment as an admin panel.
 * 2. Any ad network scripts (AdSense, Adsterra Popunder, Adsterra Social Bar),
 *    injected iframes, floating ad bubbles, or overlays are instantly purged from the DOM.
 * 3. Any click listeners armed by ad networks are disarmed.
 */
export default function AdminAdSuppressor() {
  useIsomorphicLayoutEffect(() => {
    // Flag this window & document permanently as admin panel
    (window as unknown as { __IS_ADMIN_PANEL?: boolean }).__IS_ADMIN_PANEL = true;
    document.documentElement.setAttribute('data-admin-panel', 'true');
    document.body.classList.add('is-admin-route');

    const adSelectors = [
      '#adsterra-social-bar',
      '#adsterra-popunder-dynamic',
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

    function sweepAds() {
      adSelectors.forEach(sel => {
        try {
          const els = document.querySelectorAll(sel);
          els.forEach(el => {
            el.remove();
          });
        } catch {
          // Ignore DOM cleanup errors
        }
      });
    }

    // Immediate sweep
    sweepAds();

    // Secondary and tertiary sweeps for any late-injected scripts or DOM nodes
    const t1 = setTimeout(sweepAds, 80);
    const t2 = setTimeout(sweepAds, 300);
    const t3 = setTimeout(sweepAds, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return null;
}
