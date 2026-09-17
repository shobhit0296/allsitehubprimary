'use client';

import { usePathname } from 'next/navigation';
import { isAdminRoute } from '@/lib/is-admin-route';

/**
 * SiteAds — Master Controller for all network and display advertisements.
 * 
 * CRITICAL ARCHITECTURAL RULE:
 * NEVER use MutationObserver or el.remove() on nodes in the document tree.
 * React 19 / Next.js treats body and its fiber tree strictly; manually removing
 * nodes causes "Cannot read properties of null (reading 'removeChild')" crashes.
 * 
 * Intrusive overlays, social bars, and admin ads are suppressed purely via CSS.
 */
export default function SiteAds() {
  const pathname = usePathname();
  const isAdmin = isAdminRoute(pathname);

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* Non-destructive suppression of intrusive third-party social bars & overlays */
          #adsterra-social-bar,
          [id*="adsterra-social-bar"],
          [class*="adsterra-social-bar"],
          div[class*="inpage-push"],
          div[id*="inpage-push"],
          .inpage-push,
          .inpage-push-wrapper {
            display: none !important;
            opacity: 0 !important;
            pointer-events: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
          }

          ${
            isAdmin
              ? `
            /* Admin Panel route ad suppression */
            ins.adsbygoogle,
            iframe[id^="aswift_"],
            iframe[id^="google_ads_"],
            div[id^="google_ads_"],
            div[id*="container-36a34e7c2d7095493196dd10bc56ad23"],
            .google-auto-placed,
            .adsbygoogle {
              display: none !important;
              visibility: hidden !important;
              pointer-events: none !important;
              height: 0 !important;
            }
          `
              : ''
          }
        `,
      }}
    />
  );
}
