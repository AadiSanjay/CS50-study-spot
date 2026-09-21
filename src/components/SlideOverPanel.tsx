"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { BusynessResult, Review, Spot } from "@/lib/types";
import { todayHoursLabel } from "@/lib/hours";
import { BusynessMeter } from "./BusynessMeter";
import { Sparkline } from "./Sparkline";
import { SpotArt } from "./SpotArt";
import { ReviewForm } from "./ReviewForm";
import { CheckinPanel } from "./CheckinPanel";

type DetailResponse = {
  spot: Spot;
  rating: { avgRating: number | null; avgNoise: number | null; avgWifi: number | null; count: number };
  reviews: Review[];
  myReview: Review | null;
  busyness: BusynessResult;
  openNow: boolean;
  countdown: string | null;
  currentHour: number;
  typicalCurve: number[];
  nearbyCafe: Spot | null;
  isLoggedIn: boolean;
  cooldownRemainingSeconds: number;
};

export function SlideOverPanel({
  spotId,
  onClose,
  onNavigate,
}: {
  spotId: string;
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/spots/${spotId}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [spotId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-30 bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        className="fixed right-0 top-0 z-40 h-full w-full max-w-md overflow-y-auto shadow-lift"
        style={{ background: "var(--atmo-bg)" }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
      >
        {loading || !data ? (
          <div className="p-6 text-sm" style={{ color: "var(--atmo-text-soft)" }}>
            Loading…
          </div>
        ) : (
          <PanelContent data={data} onClose={onClose} onNavigate={onNavigate} refresh={load} />
        )}
      </motion.aside>
    </AnimatePresence>
  );
}

const LEVEL_LABEL: Record<string, string> = { none: "None", some: "Some", plenty: "Plenty" };

function PanelContent({
  data,
  onClose,
  onNavigate,
  refresh,
}: {
  data: DetailResponse;
  onClose: () => void;
  onNavigate: (id: string) => void;
  refresh: () => void;
}) {
  const { spot } = data;
  const isStudySpace = spot.category === "study_space";

  return (
    <div>
      <SpotArt id={spot.id} category={spot.category} className="h-40 w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/90 text-ink flex items-center justify-center shadow-soft"
          aria-label="Close"
        >
          ✕
        </button>
      </SpotArt>

      <div className="p-6 -mt-8 relative">
        <div
          className="rounded-xl2 p-5 shadow-lift"
          style={{ background: "var(--atmo-surface)" }}
        >
          <h2 className="text-2xl" style={{ color: "var(--atmo-text)" }}>
            {spot.name}
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--atmo-text-soft)" }}>
            {spot.address}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <span
              className="text-xs font-medium rounded-full px-2.5 py-1"
              style={{
                background: data.openNow ? "var(--atmo-accent-soft)" : "var(--atmo-bg-2)",
                color: data.openNow ? "var(--atmo-accent)" : "var(--atmo-text-soft)",
              }}
            >
              {data.openNow ? "Open now" : "Closed now"}
            </span>
            {data.countdown && (
              <span className="text-xs" style={{ color: "var(--atmo-text-soft)" }}>
                {data.countdown}
              </span>
            )}
          </div>
        </div>

        <Section title="How busy is it?">
          <BusynessMeter busyness={data.busyness} />
          <div className="mt-4">
            <p className="text-xs mb-1" style={{ color: "var(--atmo-text-soft)" }}>
              Today vs. typical
            </p>
            <Sparkline
              curve={data.typicalCurve}
              currentHour={data.currentHour}
              currentLevel={data.busyness.level}
            />
          </div>
          <div className="mt-3">
            <CheckinPanel
              spotId={spot.id}
              cooldownRemainingSeconds={data.cooldownRemainingSeconds}
              isLoggedIn={data.isLoggedIn}
              onSuccess={refresh}
            />
          </div>
        </Section>

        {isStudySpace && spot.zones && spot.zones.length > 0 && (
          <Section title="Zones">
            <div className="space-y-2">
              {spot.zones.map((z) => (
                <div
                  key={z.name}
                  className="rounded-lg border p-3"
                  style={{ borderColor: "var(--atmo-line)" }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium" style={{ color: "var(--atmo-text)" }}>
                      {z.name}
                    </p>
                    <span className="text-xs" style={{ color: "var(--atmo-text-soft)" }}>
                      Noise {z.noise}/5
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--atmo-text-soft)" }}>
                    {z.floor} floor · {z.vibe}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section title="Quick facts">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Fact label="Wifi" value={LEVEL_LABEL[spot.wifi]} />
            <Fact label="Outlets" value={LEVEL_LABEL[spot.outlets]} />
            {isStudySpace && spot.food_policy && <Fact label="Food policy" value={spot.food_policy} />}
            {isStudySpace && spot.lighting && <Fact label="Lighting" value={spot.lighting} />}
            {isStudySpace && spot.capacity && <Fact label="Capacity" value={`~${spot.capacity} seats`} />}
            {isStudySpace && spot.reservable_rooms && (
              <Fact
                label="Reservable rooms"
                value={
                  spot.reservable_rooms.count > 0
                    ? spot.reservable_rooms.link
                      ? { text: `${spot.reservable_rooms.count}`, href: spot.reservable_rooms.link }
                      : `${spot.reservable_rooms.count}`
                    : "None"
                }
              />
            )}
            {isStudySpace && (
              <Fact label="Late night" value={spot.late_night ? "Yes" : "No"} />
            )}
          </div>
          {isStudySpace && spot.access_notes && (
            <p className="text-xs mt-3" style={{ color: "var(--atmo-text-soft)" }}>
              {spot.access_notes}
            </p>
          )}
        </Section>

        {isStudySpace && spot.best_for && spot.best_for.length > 0 && (
          <Section title="Best for">
            <div className="flex flex-wrap gap-1.5">
              {spot.best_for.map((b) => (
                <span
                  key={b}
                  className="text-xs rounded-full px-2.5 py-1"
                  style={{ background: "var(--atmo-accent-soft)", color: "var(--atmo-accent)" }}
                >
                  {b}
                </span>
              ))}
            </div>
          </Section>
        )}

        {!isStudySpace && spot.highlights && spot.highlights.length > 0 && (
          <Section title="On the menu">
            <div className="flex flex-wrap gap-1.5">
              {spot.highlights.map((h) => (
                <span
                  key={h}
                  className="text-xs rounded-full px-2.5 py-1"
                  style={{ background: "var(--atmo-accent-soft)", color: "var(--atmo-accent)" }}
                >
                  {h}
                </span>
              ))}
            </div>
          </Section>
        )}

        {data.nearbyCafe && (
          <Section title="Grab coffee on the way">
            <button
              onClick={() => onNavigate(data.nearbyCafe!.id)}
              className="w-full text-left rounded-lg border p-3 hover:shadow-soft transition-shadow"
              style={{ borderColor: "var(--atmo-line)" }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--atmo-text)" }}>
                {data.nearbyCafe.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--atmo-text-soft)" }}>
                {data.nearbyCafe.address}
              </p>
            </button>
          </Section>
        )}

        <Section title="Hours">
          <p className="text-sm font-medium mb-2" style={{ color: "var(--atmo-accent)" }}>
            Today: {todayHoursLabel(spot.hours)}
          </p>
        </Section>

        <Section title="Ratings & reviews">
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <Fact label="Overall" value={data.rating.avgRating?.toFixed(1) ?? "—"} center />
            <Fact label="Noise" value={data.rating.avgNoise?.toFixed(1) ?? "—"} center />
            <Fact label="Wifi" value={data.rating.avgWifi?.toFixed(1) ?? "—"} center />
          </div>
          {data.isLoggedIn ? (
            <ReviewForm spotId={spot.id} existingReview={data.myReview} onSuccess={refresh} />
          ) : (
            <p className="text-sm" style={{ color: "var(--atmo-text-soft)" }}>
              <a href="/login" className="underline" style={{ color: "var(--atmo-accent)" }}>
                Sign in
              </a>{" "}
              to leave a review.
            </p>
          )}
          <div className="mt-3 space-y-2">
            {data.reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border p-3 text-sm"
                style={{ borderColor: "var(--atmo-line)" }}
              >
                <span className="font-medium" style={{ color: "var(--atmo-text)" }}>
                  ★ {r.rating}
                </span>
                <span className="text-xs ml-2" style={{ color: "var(--atmo-text-soft)" }}>
                  noise {r.noise_rating} · wifi {r.wifi_rating}
                </span>
                {r.comment && (
                  <p className="mt-1" style={{ color: "var(--atmo-text-soft)" }}>
                    {r.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3
        className="text-xs uppercase tracking-wide mb-2"
        style={{ color: "var(--atmo-text-soft)" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function Fact({
  label,
  value,
  center,
}: {
  label: string;
  value: string | { text: string; href: string };
  center?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-2.5 ${center ? "text-center" : ""}`}
      style={{ borderColor: "var(--atmo-line)" }}
    >
      <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--atmo-text-soft)" }}>
        {label}
      </p>
      {typeof value === "string" ? (
        <p className="font-medium mt-0.5" style={{ color: "var(--atmo-text)" }}>
          {value}
        </p>
      ) : (
        <a
          href={value.href}
          target="_blank"
          rel="noreferrer"
          className="font-medium mt-0.5 underline block"
          style={{ color: "var(--atmo-accent)" }}
        >
          {value.text}
        </a>
      )}
    </div>
  );
}

