"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@/lib/types";

export function ReviewForm({
  spotId,
  existingReview,
}: {
  spotId: string;
  existingReview: Review | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [noiseRating, setNoiseRating] = useState(
    existingReview?.noise_rating ?? 3
  );
  const [wifiRating, setWifiRating] = useState(
    existingReview?.wifi_rating ?? 3
  );
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spotId,
        rating,
        noiseRating,
        wifiRating,
        comment,
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      setError("Couldn't save that review. Try again.");
      return;
    }
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-4 space-y-3"
    >
      <p className="font-medium">
        {existingReview ? "Update your review" : "Leave a review"}
      </p>

      <ScoreField label="Overall" value={rating} onChange={setRating} />
      <ScoreField label="Noise" value={noiseRating} onChange={setNoiseRating} hint="1 = quiet, 5 = loud" />
      <ScoreField label="Wifi" value={wifiRating} onChange={setWifiRating} hint="1 = unreliable, 5 = rock solid" />

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Anything else students should know? (optional)"
        rows={2}
        className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-perch-400"
      />

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-perch-600 text-cream-50 px-4 py-2 text-sm font-medium hover:bg-perch-700 transition-colors disabled:opacity-60"
      >
        {submitting ? "Saving…" : existingReview ? "Update review" : "Submit review"}
      </button>
      {error && <p className="text-xs text-clay">{error}</p>}
    </form>
  );
}

function ScoreField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span>{label}</span>
        {hint && <span className="text-xs text-ink-soft/70">{hint}</span>}
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${label} ${n}`}
            className={`h-8 w-8 rounded-full text-sm font-medium border transition-colors ${
              n <= value
                ? "bg-perch-600 text-cream-50 border-perch-600"
                : "bg-white text-ink-soft border-cream-300"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
