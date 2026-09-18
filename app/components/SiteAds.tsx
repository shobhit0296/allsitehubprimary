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
 * 
 * PROTECTED ASSETS — NEVER SUPPRESS UNDER ANY CIRCUMSTANCES:
 * 1. Stake Indian script & banner: #AdsCoreLoader106969, .ads-core-ads
 * 2. Stake Global script & banner: #clever-core, #CleverCoreLoader106970, .clever-core-ads
 */
export default function SiteAds() {
  const pathname = usePathname();
  const isAdmin = isAdminRoute(pathname);

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* Permanent suppression of intrusive mid-screen popups, social bars & floating overlays */
          #adsterra-social-bar,
          #adsterra-popunder-dynamic,
          [id*="adsterra-social-bar"],
          [class*="adsterra-social-bar"],
          [class*="social-bar"],
          [id*="social-bar"],
          div[class*="inpage-push"],
          div[id*="inpage-push"],
          .inpage-push,
          .inpage-push-wrapper {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
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
            #adsterra-social-bar,
            [id*="adsterra"],
            [class*="adsterra"],
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
