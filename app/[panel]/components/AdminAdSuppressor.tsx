'use client';

import { useEffect, useLayoutEffect } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * AdminAdSuppressor — Mounted strictly inside the Admin Panel layout.
 * Guarantees that:
 * 1. Global window and document flags permanently identify this environment as an admin panel.
 * 2. Neutralizes third-party ad runtime engines (disarms window.ppc, ad trackers).
 * 3. Hides ad containers cleanly via CSS without mutating React's DOM tree.
 */
export default function AdminAdSuppressor() {
  useIsomorphicLayoutEffect(() => {
    // 1. Permanent admin indicators
    (window as unknown as { __IS_ADMIN_PANEL?: boolean }).__IS_ADMIN_PANEL = true;
    document.documentElement.setAttribute('data-admin-panel', 'true');
    if (document.body) {
      document.body.classList.add('is-admin-route');
    }

    // 2. Disarm third-party ad engines if they attempt initialization
    try {
      (window as unknown as { ppc?: number }).ppc = 1;
    } catch {
      // ignore
    }
  }, []);

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* Admin Panel ad suppression styles */
          ins.adsbygoogle,
          iframe[id^="aswift_"],
          iframe[id^="google_ads_"],
          div[id^="google_ads_"],
          div[id*="container-36a34e7c2d7095493196dd10bc56ad23"],
          #adsterra-social-bar,
          [id*="adsterra"],
          [class*="adsterra"],
          [class*="social-bar"],
          [id*="social-bar"],
          [class*="inpage-push"],
          [id*="inpage-push"],
          .google-auto-placed,
          .google-anno-term,
          .google-anno-chip,
          [id*="google-anno-term"],
          [id*="google-anno-chip"],
          .adsbygoogle {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
            height: 0 !important;
            width: 0 !important;
            opacity: 0 !important;
          }
        `,
      }}
    />
  );
}
