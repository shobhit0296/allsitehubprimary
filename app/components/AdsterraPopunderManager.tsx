'use client';

import { useEffect } from 'react';

const ADSTERRA_SRC = 'https://bibleearthquake.com/af/43/a8/af43a8a497a35fa461a277ea55d8898a.js';
const RESET_INTERVAL_MS = 40 * 1000; // 40-second reset frequency

/**
 * AdsterraPopunderManager — Enforces an aggressive 40-second reset frequency.
 * Clears ad cookies, resets ad-tracking localStorage, and re-arms the popunder
 * event listener every 40 seconds so clicks trigger new popunder impressions.
 */
export default function AdsterraPopunderManager() {
  useEffect(() => {
    function purgeAdTracking() {
      // 1. Clear ad cookies while preserving essential site cookies
      try {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const eqPos = cookie.indexOf('=');
          const name = (eqPos > -1 ? cookie.substring(0, eqPos) : cookie).trim();
          if (name && name !== 'admin_session' && name !== 'allSiteHub_theme') {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname.replace(/^www\./, '')}`;
          }
        }
      } catch {
        // Ignore in strict environments
      }

      // 2. Clear third-party / ad-related localStorage entries
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && !key.startsWith('allSiteHub') && !key.startsWith('tbcpl')) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Ignore
      }

      // 3. Clear sessionStorage
      try {
        sessionStorage.clear();
      } catch {
        // Ignore
      }
    }

    function rearmPopunder() {
      purgeAdTracking();

      // Remove previous script instance to force complete garbage collection & re-run
      const existing = document.getElementById('adsterra-popunder-dynamic');
      if (existing) {
        existing.remove();
      }

      // Re-inject the Adsterra popunder script with timestamp to bypass browser script cache
      const script = document.createElement('script');
      script.id = 'adsterra-popunder-dynamic';
      script.src = `${ADSTERRA_SRC}?_t=${Date.now()}`;
      script.async = true;
      document.body.appendChild(script);
    }

    // Initial trigger on mount
    rearmPopunder();

    // Re-arm every 40 seconds continuously
    const interval = setInterval(() => {
      rearmPopunder();
    }, RESET_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      const existing = document.getElementById('adsterra-popunder-dynamic');
      if (existing) existing.remove();
    };
  }, []);

  return null;
}
