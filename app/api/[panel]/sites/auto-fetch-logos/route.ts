/**
 * app/api/[panel]/sites/auto-fetch-logos/route.ts
 *
 * High-speed parallel bulk logo refresh endpoint.
 * POST /api/[panel]/sites/auto-fetch-logos
 *
 * Processes sites with concurrency = 10 for ultra-fast bulk execution.
 */

import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { autoFetch4KLogo, getCachedLogoPath } from '@/lib/logo-fetcher';

export const runtime = 'nodejs';

/** Helper to run an array of async tasks with concurrency limit */
async function mapConcurrent<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function POST() {
  try {
    const db = await readDB();
    let updatedCount = 0;

    const sitesToRefresh = db.sites.filter(site => {
      const fav = site.faviconUrl ?? '';
      return (
        !fav ||
        fav.includes('google.com/s2/favicons') ||
        fav.includes('duckduckgo.com') ||
        fav.includes('icon.horse') ||
        fav.includes('clearbit') ||
        fav.includes('gstatic.com') ||
        (fav.startsWith('/logos/') && !getCachedLogoPath(site.domain))
      );
    });

    if (sitesToRefresh.length > 0) {
      await mapConcurrent(sitesToRefresh, 10, async site => {
        try {
          const localLogo = await autoFetch4KLogo(site.domain);
          if (localLogo) {
            site.faviconUrl = localLogo;
            updatedCount++;
          }
        } catch {
          // ignore individual failure
        }
      });

      if (updatedCount > 0) {
        await writeDB(db);
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      totalSites: db.sites.length,
      refreshedCandidates: sitesToRefresh.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
