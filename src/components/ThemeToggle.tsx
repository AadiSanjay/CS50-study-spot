"use client";

import { useAtmosphere } from "./ThemeProvider";
import { PERIOD_LABEL, type Period } from "@/lib/theme";

const CYCLE: (Period | "auto")[] = ["auto", "morning", "afternoon", "night"];

export function ThemeToggle() {
  const { override, period, setOverride } = useAtmosphere();

  function next() {
    const idx = CYCLE.indexOf(override);
    setOverride(CYCLE[(idx + 1) % CYCLE.length]);
  }

  return (
    <button
      onClick={next}
      className="flex items-center gap-1.5 rounded-full border border-[var(--atmo-line)] bg-[var(--atmo-surface)] px-3 py-1.5 text-xs font-medium text-[var(--atmo-text-soft)] hover:text-[var(--atmo-text)] transition-colors"
      title="Cycle time-of-day atmosphere"
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: "var(--atmo-accent)" }}
        aria-hidden="true"
      />
      {override === "auto" ? `Auto · ${PERIOD_LABEL[period]}` : PERIOD_LABEL[period]}
    </button>
  );
}
