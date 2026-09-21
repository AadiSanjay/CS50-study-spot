import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getRatingSummary,
  getRecentCheckins,
  getReviews,
  getSpot,
} from "@/lib/data";
import { computeBusyness, CHECKIN_COOLDOWN_MINUTES, TYPICAL_CURVE } from "@/lib/busyness";
import { currentChicagoHour, isOpenNow, openCloseCountdown } from "@/lib/hours";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const spot = await getSpot(supabase, id);
  if (!spot) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const [rating, reviews, recentCheckins, userResult, nearbyCafe] = await Promise.all([
    getRatingSummary(supabase, spot.id),
    getReviews(supabase, spot.id),
    getRecentCheckins(supabase, spot.id),
    supabase.auth.getUser(),
    spot.nearby_cafe_id ? getSpot(supabase, spot.nearby_cafe_id) : Promise.resolve(null),
  ]);

  const user = userResult.data.user;
  const now = new Date();
  const busyness = computeBusyness(recentCheckins, spot.category, now);

  const myReview = user ? reviews.find((r) => r.user_id === user.id) ?? null : null;

  let cooldownRemainingSeconds = 0;
  if (user) {
    const mine = recentCheckins
      .filter((c) => c.user_id === user.id)
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
    if (mine) {
      const elapsedMs = Date.now() - new Date(mine.created_at).getTime();
      cooldownRemainingSeconds = Math.max(
        0,
        CHECKIN_COOLDOWN_MINUTES * 60 - Math.floor(elapsedMs / 1000)
      );
    }
  }

  return NextResponse.json({
    spot,
    rating,
    reviews,
    myReview,
    busyness,
    openNow: isOpenNow(spot.hours, now),
    countdown: openCloseCountdown(spot.hours, now),
    currentHour: currentChicagoHour(now),
    typicalCurve: TYPICAL_CURVE[spot.category],
    nearbyCafe,
    isLoggedIn: Boolean(user),
    cooldownRemainingSeconds,
  });
}
