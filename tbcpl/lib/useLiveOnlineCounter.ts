'use client';

import { useState, useEffect } from 'react';

/**
 * Returns the min/max active user range: 1,500 - 4,200
 * With natural time-of-day distribution within 1,500 to 4,200:
 *  - 06:00 AM - 12:00 PM: 1,800 - 3,200
 *  - 12:00 PM - 05:00 PM: 1,500 - 2,900
 *  - 05:00 PM - 12:00 AM: 2,600 - 4,200 (Peak evening)
 *  - 12:00 AM - 06:00 AM: 1,500 - 2,400 (Night base)
 */
export function getLiveUserRange(date: Date = new Date()): { min: number; max: number } {
  const hour = date.getHours();

  if (hour >= 6 && hour < 12) {
    return { min: 1800, max: 3200 };
  } else if (hour >= 12 && hour < 17) {
    return { min: 1500, max: 2900 };
  } else if (hour >= 17 && hour < 24) {
    return { min: 2600, max: 4200 };
  } else {
    // 00:00 to 05:59 (Midnight to 6 AM)
    return { min: 1500, max: 2400 };
  }
}

/**
 * Generates an initial random count within the current time-slot bounds.
 */
export function generateInitialLiveUserCount(date: Date = new Date()): number {
  const { min, max } = getLiveUserRange(date);
  return Math.floor(min + Math.random() * (max - min));
}

/** Stable deterministic baseline for SSR to prevent hydration mismatches */
const DEFAULT_SSR_COUNT = 2850;

/**
 * Hook that updates the online user counter every 15-20 seconds.
 * - Fluctuation: subtle micro up & down (±3 to ±14 users).
 * - Schedule Transition: chooses the nearest valid boundary digit with slight jitter.
 */
export function useLiveOnlineCounter(): number {
  const [count, setCount] = useState<number>(DEFAULT_SSR_COUNT);

  useEffect(() => {
    // Set initial client-side value inside current range
    setCount(generateInitialLiveUserCount());

    let timeoutId: NodeJS.Timeout;

    const scheduleNextTick = () => {
      // Fluctuate every 15 to 20 seconds
      const nextDelay = 15000 + Math.random() * 5000;

      timeoutId = setTimeout(() => {
        setCount(prev => {
          const { min, max } = getLiveUserRange(new Date());

          // When shifting to a higher schedule block: land on the nearest bottom edge with small random jitter
          if (prev < min) {
            const nearestBottom = min + Math.floor(Math.random() * 35); // e.g. min + 12
            return Math.min(max, nearestBottom);
          }

          // When shifting to a lower schedule block: land on the nearest top edge with small random jitter
          if (prev > max) {
            const nearestTop = max - Math.floor(Math.random() * 35); // e.g. max - 15
            return Math.max(min, nearestTop);
          }

          // Inside the current block: slight, gentle micro-fluctuation (±3 to ±14 users)
          const delta = Math.floor(Math.random() * 25) - 12; // -12 to +12
          const next = prev + (delta === 0 ? (Math.random() > 0.5 ? 4 : -4) : delta);

          return Math.min(max, Math.max(min, next));
        });

        scheduleNextTick();
      }, nextDelay);
    };

    scheduleNextTick();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return count;
}
