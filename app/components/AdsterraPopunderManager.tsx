'use client';

import { useEffect } from 'react';

/**
 * AdsterraPopunderManager — Neutralized.
 * Pop-up ads, social bars, and popunders have been permanently disabled.
 */
export default function AdsterraPopunderManager() {
  useEffect(() => {
    // Ensure any previously injected popunder or social-bar scripts are purged
    const dynamic = document.getElementById('adsterra-popunder-dynamic');
    if (dynamic) dynamic.remove();

    const socialBar = document.getElementById('adsterra-social-bar');
    if (socialBar) socialBar.remove();

    const badScripts = document.querySelectorAll('script[src*="af43a8a497a35fa461a277ea55d8898a"]');
    badScripts.forEach(s => s.remove());
  }, []);

  return null;
}
