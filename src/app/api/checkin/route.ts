import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CHECKIN_COOLDOWN_MINUTES } from "@/lib/busyness";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json();
  const spotId = String(body.spotId ?? "");
  const busyness = Number(body.busyness);
  if (!spotId || !Number.isInteger(busyness) || busyness < 1 || busyness > 5) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  const cooldownStart = new Date(
    Date.now() - CHECKIN_COOLDOWN_MINUTES * 60 * 1000
  ).toISOString();

  const { data: recent, error: recentError } = await supabase
    .from("checkins")
    .select("created_at")
    .eq("spot_id", spotId)
    .eq("user_id", user.id)
    .gte("created_at", cooldownStart)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentError) {
    return NextResponse.json({ error: recentError.message }, { status: 500 });
  }

  if (recent) {
    const elapsedMs = Date.now() - new Date(recent.created_at).getTime();
    const retryAfterSeconds = Math.max(
      0,
      CHECKIN_COOLDOWN_MINUTES * 60 - Math.floor(elapsedMs / 1000)
    );
    return NextResponse.json(
      { error: "cooldown", retryAfterSeconds },
      { status: 429 }
    );
  }

  const { error: insertError } = await supabase
    .from("checkins")
    .insert({ spot_id: spotId, user_id: user.id, busyness });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
