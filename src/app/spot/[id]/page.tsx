import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getRatingSummary,
  getRecentCheckins,
  getReviews,
  getSpot,
} from "@/lib/data";
import { computeBusyness, CHECKIN_COOLDOWN_MINUTES } from "@/lib/busyness";
import {
  DAY_LABELS,
  WEEK_ORDER,
  formatDayHours,
  isOpenNow,
  todayHoursLabel,
} from "@/lib/hours";
import { visibleTags } from "@/lib/spot-utils";
import { BusynessPill, busynessBasisLabel } from "@/components/BusynessPill";
import { CheckinPanel } from "@/components/CheckinPanel";
import { ReviewForm } from "@/components/ReviewForm";

const LEVEL_LABEL: Record<string, string> = {
  none: "None",
  some: "Some",
  plenty: "Plenty",
};

export default async function SpotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const spot = await getSpot(supabase, id);
  if (!spot) notFound();

  const [rating, reviews, recentCheckins, userResult] = await Promise.all([
    getRatingSummary(supabase, spot.id),
    getReviews(supabase, spot.id),
    getRecentCheckins(supabase, spot.id),
    supabase.auth.getUser(),
  ]);

  const user = userResult.data.user;
  const now = new Date();
  const busyness = computeBusyness(recentCheckins, spot.category, now);
  const openNow = isOpenNow(spot.hours, now);

  const myReview = user
    ? reviews.find((r) => r.user_id === user.id) ?? null
    : null;

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

  return (
    <div>
      <a href="/" className="text-sm text-perch-700 hover:underline">
        ← Back
      </a>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl leading-tight">{spot.name}</h1>
          <p className="text-ink-soft mt-1">{spot.address}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium rounded-full px-2.5 py-1 ${
            openNow ? "bg-perch-50 text-perch-700" : "bg-ink/5 text-ink-soft"
          }`}
        >
          {openNow ? "Open now" : "Closed now"}
        </span>
      </div>

      {visibleTags(spot.tags).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleTags(spot.tags).map((tag) => (
            <span
              key={tag}
              className="text-[11px] uppercase tracking-wide text-perch-600/80 bg-perch-50 rounded-full px-2 py-0.5"
            >
              {tag.replace(/-/g, " ")}
            </span>
          ))}
        </div>
      )}

      {spot.source_url && (
        <a
          href={spot.source_url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs text-ink-soft/70 hover:text-perch-700 underline"
        >
          Source
        </a>
      )}

      <section className="card p-4 mt-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Amenity label="Wifi" value={LEVEL_LABEL[spot.wifi]} />
          <Amenity label="Outlets" value={LEVEL_LABEL[spot.outlets]} />
          <Amenity label="Noise" value={`${spot.noise} / 5`} />
        </div>
      </section>

      <section className="card p-4 mt-4">
        <h2 className="text-xl mb-3">How busy is it?</h2>
        <div className="flex items-center gap-2 mb-3">
          <BusynessPill busyness={busyness} />
          <span className="text-xs text-ink-soft">
            {busynessBasisLabel(busyness)}
          </span>
        </div>
        <CheckinPanel
          spotId={spot.id}
          cooldownRemainingSeconds={cooldownRemainingSeconds}
          isLoggedIn={Boolean(user)}
        />
      </section>

      <section className="card p-4 mt-4">
        <h2 className="text-xl mb-3">Hours</h2>
        <p className="text-sm text-perch-700 font-medium mb-2">
          Today: {todayHoursLabel(spot.hours, now)}
        </p>
        <ul className="text-sm text-ink-soft divide-y divide-cream-200">
          {WEEK_ORDER.map((day) => (
            <li key={day} className="flex justify-between py-1.5">
              <span>{DAY_LABELS[day]}</span>
              <span>{formatDayHours(spot.hours[day])}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4">
        <h2 className="text-xl mb-3">Ratings &amp; reviews</h2>
        <div className="card p-4 mb-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Amenity label="Overall" value={rating.avgRating?.toFixed(1) ?? "—"} />
            <Amenity label="Noise" value={rating.avgNoise?.toFixed(1) ?? "—"} />
            <Amenity label="Wifi" value={rating.avgWifi?.toFixed(1) ?? "—"} />
          </div>
          <p className="text-xs text-ink-soft/70 text-center mt-2">
            {rating.count} review{rating.count === 1 ? "" : "s"}
          </p>
        </div>

        {user ? (
          <div className="mb-4">
            <ReviewForm spotId={spot.id} existingReview={myReview} />
          </div>
        ) : (
          <p className="text-sm text-ink-soft mb-4">
            <a href="/login" className="text-perch-700 underline">
              Sign in
            </a>{" "}
            to leave a review.
          </p>
        )}

        <div className="space-y-3">
          {reviews.length === 0 && (
            <p className="text-sm text-ink-soft/70">
              No reviews yet — be the first.
            </p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="card p-3 text-sm">
              <div className="flex items-center gap-2 text-ink-soft">
                <span className="font-medium text-ink">★ {r.rating}</span>
                <span>· noise {r.noise_rating}</span>
                <span>· wifi {r.wifi_rating}</span>
              </div>
              {r.comment && <p className="mt-1.5">{r.comment}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Amenity({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-soft/70">
        {label}
      </p>
      <p className="text-lg font-medium mt-0.5">{value}</p>
    </div>
  );
}
