/**
 * lib/activeUsers.ts
 *
 * Computes all-time active users starting from 128,450 (> 1.2 Lakhs)
 * with a daily random addition of ~25,000 users (between 23,500 and 26,500)
 * accumulating smoothly each day.
 */

// Anchor starting date: August 14, 2026
const ANCHOR_TIME = new Date('2026-08-14T00:00:00Z').getTime();
const BASE_USERS = 128450;

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Calculates current all-time active users based on the number of elapsed days + intraday progression.
 */
export function calculateAllTimeActiveUsers(date: Date = new Date()): number {
  const now = date.getTime();
  const diffMs = Math.max(0, now - ANCHOR_TIME);
  const fullDays = Math.floor(diffMs / 86400000);

  let accumulated = BASE_USERS;

  // Add daily random ~25k for each completed day
  for (let i = 0; i < fullDays; i++) {
    const dailyDelta = Math.floor(23500 + pseudoRandom(i + 100) * 3000); // 23,500 - 26,500
    accumulated += dailyDelta;
  }

  // Intraday continuous addition throughout the current day
  const msToday = diffMs % 86400000;
  const fractionToday = msToday / 86400000;
  const todayGoal = Math.floor(23500 + pseudoRandom(fullDays + 100) * 3000);
  const intradayAdded = Math.floor(fractionToday * todayGoal);

  return accumulated + intradayAdded;
}
