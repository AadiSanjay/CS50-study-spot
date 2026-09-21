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
import { SpotArt } from "@/components/SpotArt";
import { openCloseCountdown } from "@/lib/hours";

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
  const openNow = isOpenNow(spot.hours, now);
  const countdown = openCloseCountdown(spot.hours, now);
  const isStudySpace = spot.category === "study_space";

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

      <SpotArt id={spot.id} category={spot.category} className="h-32 w-full rounded-xl2 mt-3" />

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl leading-tight">{spot.name}</h1>
          <p className="text-ink-soft mt-1">{spot.address}</p>
        </div>
        <div className="shrink-0 text-right">
          <span
            className={`inline-block text-xs font-medium rounded-full px-2.5 py-1 ${
              openNow ? "bg-perch-50 text-perch-700" : "bg-ink/5 text-ink-soft"
            }`}
          >
            {openNow ? "Open now" : "Closed now"}
          </span>
          {countdown && (
            <p className="text-[11px] text-ink-soft/70 mt-1">{countdown}</p>
          )}
        </div>
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
        {isStudySpace && (
          <div className="grid grid-cols-3 gap-3 text-center mt-3 pt-3 border-t border-cream-200">
            {spot.food_policy && <Amenity label="Food policy" value={spot.food_policy} />}
            {spot.lighting && <Amenity label="Lighting" value={spot.lighting} />}
            {spot.capacity != null && <Amenity label="Capacity" value={`~${spot.capacity}`} />}
            {spot.reservable_rooms && (
              <Amenity
                label="Reservable rooms"
                value={spot.reservable_rooms.count > 0 ? String(spot.reservable_rooms.count) : "None"}
                href={spot.reservable_rooms.link ?? undefined}
              />
            )}
            <Amenity label="Late night" value={spot.late_night ? "Yes" : "No"} />
          </div>
        )}
        {isStudySpace && spot.access_notes && (
          <p className="text-xs text-ink-soft/70 mt-3">{spot.access_notes}</p>
        )}
      </section>

      {isStudySpace && spot.zones && spot.zones.length > 0 && (
        <section className="card p-4 mt-4">
          <h2 className="text-xl mb-3">Zones</h2>
          <div className="space-y-2">
            {spot.zones.map((z) => (
              <div key={z.name} className="rounded-lg border border-cream-200 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{z.name}</p>
                  <span className="text-xs text-ink-soft">Noise {z.noise}/5</span>
                </div>
                <p className="text-xs text-ink-soft/80 mt-0.5">
                  {z.floor} floor · {z.vibe}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {((isStudySpace && spot.best_for && spot.best_for.length > 0) ||
        (!isStudySpace && spot.highlights && spot.highlights.length > 0)) && (
        <section className="card p-4 mt-4">
          <h2 className="text-xl mb-3">{isStudySpace ? "Best for" : "On the menu"}</h2>
          <div className="flex flex-wrap gap-1.5">
            {(isStudySpace ? spot.best_for : spot.highlights)!.map((item) => (
              <span
                key={item}
                className="text-xs rounded-full px-2.5 py-1 bg-perch-50 text-perch-700"
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      )}

      {nearbyCafe && (
        <section className="card p-4 mt-4">
          <h2 className="text-xl mb-3">Grab coffee on the way</h2>
          <a
            href={`/spot/${nearbyCafe.id}`}
            className="block rounded-lg border border-cream-200 p-3 hover:border-perch-400 transition-colors"
          >
            <p className="text-sm font-medium">{nearbyCafe.name}</p>
            <p className="text-xs text-ink-soft/80 mt-0.5">{nearbyCafe.address}</p>
          </a>
        </section>
      )}

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

function Amenity({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-soft/70">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-lg font-medium mt-0.5 underline text-perch-700 block"
        >
          {value}
        </a>
      ) : (
        <p className="text-lg font-medium mt-0.5">{value}</p>
      )}
    </div>
  );
}
