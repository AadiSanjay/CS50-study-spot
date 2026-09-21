import type { BusynessResult } from "@/lib/types";

const LEVEL_LABEL = ["", "Quiet", "Calm", "Moderate", "Busy", "Packed"];

const LEVEL_STYLE = [
  "",
  "bg-perch-50 text-perch-700 border-perch-200",
  "bg-perch-50 text-perch-700 border-perch-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-orange-50 text-orange-700 border-orange-200",
  "bg-clay-light/40 text-clay border-clay-light",
];

export function BusynessPill({
  busyness,
  className = "",
}: {
  busyness: BusynessResult;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${LEVEL_STYLE[busyness.level]} ${className}`}
      title={
        busyness.basis === "reports"
          ? `Based on ${busyness.sampleSize} recent report${busyness.sampleSize === 1 ? "" : "s"}`
          : "Typical for this time"
      }
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {LEVEL_LABEL[busyness.level]}
    </span>
  );
}

export function busynessBasisLabel(busyness: BusynessResult): string {
  return busyness.basis === "reports"
    ? `Based on ${busyness.sampleSize} recent report${busyness.sampleSize === 1 ? "" : "s"}`
    : "Typical for this time";
}
