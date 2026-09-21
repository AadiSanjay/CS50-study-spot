"use client";

import { useMemo, useState } from "react";
import type { Category } from "@/lib/types";
import { SpotCard, type SpotWithMeta } from "./SpotCard";
import { SegmentedTabs } from "./SegmentedTabs";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { DesktopSplitView } from "./DesktopSplitView";
import { SlideOverPanel } from "./SlideOverPanel";
import { useMediaQuery } from "@/lib/use-media-query";

function matchesQuery(spot: SpotWithMeta, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    spot.name.toLowerCase().includes(q) ||
    spot.address.toLowerCase().includes(q) ||
    spot.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function ExploreView({ spots }: { spots: SpotWithMeta[] }) {
  const [tab, setTab] = useState<Category>("cafe");
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [sortByRating, setSortByRating] = useState(false);
  const [query, setQuery] = useState("");
  const [openSpotId, setOpenSpotId] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const filtered = useMemo(() => {
    let list = spots.filter((s) => s.category === tab && matchesQuery(s, query));
    if (openNowOnly) list = list.filter((s) => s.openNow);
    if (sortByRating) {
      list = [...list].sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    }
    return list;
  }, [spots, tab, openNowOnly, sortByRating, query]);

  return (
    <div>
      {/* Sticky header: segmented tabs, search, open-now toggle, atmosphere toggle */}
      <div
        className="sticky z-10 -mx-4 px-4 lg:-mx-0 lg:px-0 py-3 mb-4 flex flex-wrap items-center gap-3 lg:gap-4"
        style={{ top: "env(safe-area-inset-top, 0px)" }}
      >
        <SegmentedTabs value={tab} onChange={setTab} />
        <SearchBar value={query} onChange={setQuery} />
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm" style={{ color: "var(--atmo-text-soft)" }}>
          <input
            type="checkbox"
            checked={openNowOnly}
            onChange={(e) => setOpenNowOnly(e.target.checked)}
            className="h-4 w-4 rounded accent-perch-600"
          />
          Open now
        </label>
        <label className="hidden lg:flex items-center gap-2 cursor-pointer select-none text-sm" style={{ color: "var(--atmo-text-soft)" }}>
          <input
            type="checkbox"
            checked={sortByRating}
            onChange={(e) => setSortByRating(e.target.checked)}
            className="h-4 w-4 rounded accent-perch-600"
          />
          Sort by rating
        </label>
        <div className="hidden lg:block ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile / tablet: simple stacked grid, unchanged behavior (navigates to /spot/[id]) */}
      <div className="lg:hidden">
        <div className="flex items-center gap-4 mb-4 text-sm">
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
              <SpotCard key={spot.id} spot={spot} showArt />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: split list + map, slide-over detail panel. Gated on a JS
          media query (not just CSS `hidden`) so the map never mounts and
          fetches tiles on a phone. */}
      {isDesktop && <DesktopSplitView spots={filtered} onOpenDetail={setOpenSpotId} />}

      {openSpotId && (
        <SlideOverPanel
          spotId={openSpotId}
          onClose={() => setOpenSpotId(null)}
          onNavigate={setOpenSpotId}
        />
      )}
    </div>
  );
}
