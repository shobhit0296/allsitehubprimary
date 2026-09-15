'use client';

import { useEffect, useLayoutEffect } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const AD_SELECTORS = [
  '#adsterra-social-bar',
  '#adsterra-popunder-dynamic',
  '[id*="adsterra"]',
  '[class*="adsterra"]',
  '[class*="social-bar"]',
  '[id*="social-bar"]',
  '[class*="inpage-push"]',
  '[id*="inpage-push"]',
  'script[src*="profitableratecpmnetwork.com"]',
  'script[src*="bibleearthquake.com"]',
  'script[src*="pagead2.googlesyndication.com"]',
  'script[src*="highcpmgate.com"]',
  'script[src*="doubleclick.net"]',
  'script[src*="adservice"]',
  'ins.adsbygoogle',
  'iframe[id^="aswift_"]',
  'iframe[id^="google_ads_"]',
  'div[id^="google_ads_"]',
  'div[id^="container-36a34e7c2d7095493196dd10bc56ad23"]',
  '.google-auto-placed',
  '.google-anno-term',
  '.google-anno-chip',
  '[class*="google-anno"]',
  '[id*="google-anno"]',
  '.adsbygoogle',
];

/**
 * AdminAdSuppressor — Mounted strictly inside the Admin Panel layout.
 * Guarantees that:
 * 1. Global window and document flags permanently identify this environment as an admin panel.
 * 2. Neutralizes ad runtime engines (disarms window.ppc, ad trackers).
 * 3. Any ad network scripts (AdSense, Adsterra Popunder, Adsterra Social Bar),
 *    injected iframes, floating ad bubbles, or overlays are instantly purged.
 * 4. A persistent MutationObserver intercepts and removes any ad elements added to the DOM dynamically.
 */
export default function AdminAdSuppressor() {
  useIsomorphicLayoutEffect(() => {
    // 1. Permanent admin indicators
    (window as unknown as { __IS_ADMIN_PANEL?: boolean }).__IS_ADMIN_PANEL = true;
    document.documentElement.setAttribute('data-admin-panel', 'true');
    document.body.classList.add('is-admin-route');

    // 2. Disarm third-party ad engines if they attempt initialization
    try {
      (window as unknown as { ppc?: number }).ppc = 1;
    } catch {
      // ignore
    }

    function purgeAdNodes() {
      AD_SELECTORS.forEach(sel => {
        try {
          const els = document.querySelectorAll(sel);
          els.forEach(el => el.remove());
        } catch {
          // ignore
        }
      });
    }

    // Immediate sweep
    purgeAdNodes();

    // 3. Persistent MutationObserver to catch dynamically injected ads in real-time
    let observer: MutationObserver | null = null;
    try {
      observer = new MutationObserver(mutations => {
        let shouldSweep = false;
        for (const m of mutations) {
          for (let i = 0; i < m.addedNodes.length; i++) {
            const node = m.addedNodes[i];
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              const tagName = el.tagName.toLowerCase();
              if (
                tagName === 'script' ||
                tagName === 'iframe' ||
                tagName === 'ins' ||
                el.id?.toLowerCase().includes('adsterra') ||
                el.id?.toLowerCase().includes('social-bar') ||
                el.className?.toString().toLowerCase().includes('social-bar') ||
                el.className?.toString().toLowerCase().includes('adsterra')
              ) {
                shouldSweep = true;
                break;
              }
            }
          }
          if (shouldSweep) break;
        }

        if (shouldSweep) {
          purgeAdNodes();
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    } catch {
      // ignore observer errors in restricted environments
    }

    // Timed sweeps as safety nets for delayed asynchronous ad scripts
    const t1 = setTimeout(purgeAdNodes, 50);
    const t2 = setTimeout(purgeAdNodes, 250);
    const t3 = setTimeout(purgeAdNodes, 800);
    const t4 = setTimeout(purgeAdNodes, 2000);

    return () => {
      if (observer) {
        observer.disconnect();
      }
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return null;
}
