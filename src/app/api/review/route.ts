import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json();
  const spotId = String(body.spotId ?? "");
  const rating = Number(body.rating);
  const noiseRating = Number(body.noiseRating);
  const wifiRating = Number(body.wifiRating);
  const comment =
    typeof body.comment === "string" && body.comment.trim().length > 0
      ? body.comment.trim().slice(0, 1000)
      : null;

  const scoresValid = [rating, noiseRating, wifiRating].every(
    (n) => Number.isInteger(n) && n >= 1 && n <= 5
  );
  if (!spotId || !scoresValid) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      spot_id: spotId,
      user_id: user.id,
      rating,
      noise_rating: noiseRating,
      wifi_rating: wifiRating,
      comment,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "spot_id,user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
