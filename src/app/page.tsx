import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getAllRatingSummaries,
  getAllRecentCheckins,
  getSpots,
} from "@/lib/data";
import { computeBusyness } from "@/lib/busyness";
import { isOpenNow } from "@/lib/hours";
import { ExploreView } from "@/components/ExploreView";
import type { SpotWithMeta } from "@/components/SpotCard";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const [spots, ratings, checkinsBySpot] = await Promise.all([
    getSpots(supabase),
    getAllRatingSummaries(supabase),
    getAllRecentCheckins(supabase),
  ]);

  const now = new Date();
  const spotsWithMeta: SpotWithMeta[] = spots.map((spot) => {
    const rating = ratings[spot.id];
    return {
      ...spot,
      openNow: isOpenNow(spot.hours, now),
      avgRating: rating?.avgRating ?? null,
      reviewCount: rating?.count ?? 0,
      busyness: computeBusyness(
        checkinsBySpot[spot.id] ?? [],
        spot.category,
        now
      ),
    };
  });

  return (
    <div>
      <h1 className="text-3xl mb-1">Find your perch</h1>
      <p className="text-ink-soft mb-6">
        Cafés and study spaces around UIUC — rated by students, right now.
      </p>
      <ExploreView spots={spotsWithMeta} />
    </div>
  );
}
