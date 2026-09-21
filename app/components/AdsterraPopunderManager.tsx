'use client';

/**
 * AdsterraPopunderManager
 * The Adsterra Anti-AdBlock Popunder / Redirection script is loaded cleanly via
 * the frequency-capped Next.js <Script id="adsterra-popunder-capper"> in app/layout.tsx.
 * It strictly caps popunders to a maximum of 2 per 24 hours (with a 6-hour minimum cooldown
 * between impressions) to preserve user experience, prevent ad fatigue, and maximize CPM.
 */
export default function AdsterraPopunderManager() {
  return null;
}
