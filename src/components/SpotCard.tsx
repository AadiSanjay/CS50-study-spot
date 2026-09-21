import Link from "next/link";
import type { BusynessResult, Spot } from "@/lib/types";
import { visibleTags } from "@/lib/spot-utils";
import { BusynessPill } from "./BusynessPill";

export type SpotWithMeta = Spot & {
  openNow: boolean;
  avgRating: number | null;
  reviewCount: number;
  busyness: BusynessResult;
};

export function SpotCard({ spot }: { spot: SpotWithMeta }) {
  return (
    <Link
      href={`/spot/${spot.id}`}
      className="card block p-4 hover:shadow-lift hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg leading-snug">{spot.name}</h3>
        <span
          className={`shrink-0 mt-0.5 text-xs font-medium rounded-full px-2 py-0.5 ${
            spot.openNow
              ? "bg-perch-50 text-perch-700"
              : "bg-ink/5 text-ink-soft"
          }`}
        >
          {spot.openNow ? "Open" : "Closed"}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-3 text-sm text-ink-soft">
        <span className="flex items-center gap-1">
          <span aria-hidden="true">★</span>
          {spot.avgRating ? spot.avgRating.toFixed(1) : "—"}
          {spot.reviewCount > 0 && (
            <span className="text-ink-soft/60">({spot.reviewCount})</span>
          )}
        </span>
        <BusynessPill busyness={spot.busyness} />
      </div>

      {visibleTags(spot.tags).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleTags(spot.tags).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] uppercase tracking-wide text-perch-600/80 bg-perch-50 rounded-full px-2 py-0.5"
            >
              {tag.replace(/-/g, " ")}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
