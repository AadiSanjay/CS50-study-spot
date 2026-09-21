"use client";

import { useMemo, useState } from "react";
import type { Category } from "@/lib/types";
import { SpotCard, type SpotWithMeta } from "./SpotCard";

export function ExploreView({ spots }: { spots: SpotWithMeta[] }) {
  const [tab, setTab] = useState<Category>("cafe");
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [sortByRating, setSortByRating] = useState(false);

  const filtered = useMemo(() => {
    let list = spots.filter((s) => s.category === tab);
    if (openNowOnly) list = list.filter((s) => s.openNow);
    if (sortByRating) {
      list = [...list].sort(
        (a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0)
      );
    }
    return list;
  }, [spots, tab, openNowOnly, sortByRating]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <TabButton active={tab === "cafe"} onClick={() => setTab("cafe")}>
          Cafés
        </TabButton>
        <TabButton
          active={tab === "study_space"}
          onClick={() => setTab("study_space")}
        >
          Study Spaces
        </TabButton>
      </div>

      <div className="flex items-center gap-4 mb-5 text-sm">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={openNowOnly}
            onChange={(e) => setOpenNowOnly(e.target.checked)}
            className="h-4 w-4 rounded accent-perch-600"
          />
          Open now
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sortByRating}
            onChange={(e) => setSortByRating(e.target.checked)}
            className="h-4 w-4 rounded accent-perch-600"
          />
          Sort by rating
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink-soft text-sm py-8 text-center">
          No spots match right now — try clearing a filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-perch-600 text-cream-50"
          : "bg-white text-ink-soft border border-cream-300 hover:border-perch-400"
      }`}
    >
      {children}
    </button>
  );
}
