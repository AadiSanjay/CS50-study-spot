"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const LEVELS = [
  { value: 1, label: "Quiet" },
  { value: 2, label: "Calm" },
  { value: 3, label: "Moderate" },
  { value: 4, label: "Busy" },
  { value: 5, label: "Packed" },
];

export function CheckinPanel({
  spotId,
  cooldownRemainingSeconds,
  isLoggedIn,
  onSuccess,
}: {
  spotId: string;
  cooldownRemainingSeconds: number;
  isLoggedIn: boolean;
  /** Called instead of router.refresh() — used by the slide-over, which fetches its own data. */
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(cooldownRemainingSeconds);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setRemaining(cooldownRemainingSeconds), [
    cooldownRemainingSeconds,
  ]);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  if (!isLoggedIn) {
    return (
      <p className="text-sm text-ink-soft">
        <a href="/login" className="text-perch-700 underline">
          Sign in
        </a>{" "}
        to report how busy it is.
      </p>
    );
  }

  async function submit(busyness: number) {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotId, busyness }),
    });
    setSubmitting(false);

    if (res.status === 429) {
      const body = await res.json().catch(() => null);
      setRemaining(body?.retryAfterSeconds ?? 20 * 60);
      setError("You already checked in recently — thanks for the report!");
      return;
    }
    if (!res.ok) {
      setError("Couldn't submit that. Try again.");
      return;
    }
    setRemaining(20 * 60);
    if (onSuccess) onSuccess();
    else router.refresh();
  }

  if (remaining > 0) {
    const mins = Math.ceil(remaining / 60);
    return (
      <p className="text-sm text-ink-soft">
        Thanks for the report! You can check in again in {mins} min.
      </p>
    );
  }

  return (
    <div>
      <p className="text-sm text-ink-soft mb-2">How busy is it right now?</p>
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            disabled={submitting}
            onClick={() => submit(l.value)}
            className="rounded-full border border-cream-300 bg-white px-3 py-1.5 text-sm hover:border-perch-400 hover:bg-perch-50 disabled:opacity-50 transition-colors"
          >
            {l.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-clay mt-2">{error}</p>}
    </div>
  );
}
