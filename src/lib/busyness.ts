import type { BusynessResult, Category, Checkin } from "./types";
import { currentChicagoHour } from "./hours";

const HALF_LIFE_MINUTES = 30;
const MAX_AGE_MINUTES = 120;
const DECAY_LAMBDA = Math.LN2 / HALF_LIFE_MINUTES;

// Hardcoded "typical busyness by hour" fallback, 1 (quiet) - 5 (packed), hour-of-day 0-23.
export const TYPICAL_CURVE: Record<Category, number[]> = {
  cafe: [1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 4, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1],
  study_space: [2, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 4, 3],
};

/**
 * Weighted-average busyness from recent check-ins, with exponential time decay
 * (30-min half-life). Check-ins older than 2 hours are dropped entirely rather
 * than merely decayed, since by then they're stale rather than "less confident".
 * Falls back to a typical-for-this-hour curve when there's no recent signal.
 */
export function computeBusyness(
  checkins: Checkin[],
  category: Category,
  now: Date = new Date()
): BusynessResult {
  const nowMs = now.getTime();
  const recent = checkins.filter((c) => {
    const ageMinutes = (nowMs - new Date(c.created_at).getTime()) / 60000;
    return ageMinutes >= 0 && ageMinutes <= MAX_AGE_MINUTES;
  });

  if (recent.length === 0) {
    const hour = currentChicagoHour(now);
    return {
      level: TYPICAL_CURVE[category][hour],
      basis: "typical",
      sampleSize: 0,
    };
  }

  let weightedSum = 0;
  let weightTotal = 0;
  for (const c of recent) {
    const ageMinutes = (nowMs - new Date(c.created_at).getTime()) / 60000;
    const weight = Math.exp(-DECAY_LAMBDA * ageMinutes);
    weightedSum += weight * c.busyness;
    weightTotal += weight;
  }

  const level = Math.round(weightedSum / weightTotal);
  return {
    level: Math.min(5, Math.max(1, level)),
    basis: "reports",
    sampleSize: recent.length,
  };
}

export const CHECKIN_COOLDOWN_MINUTES = 20;
