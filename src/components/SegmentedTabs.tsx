"use client";

import { motion } from "framer-motion";
import type { Category } from "@/lib/types";

const OPTIONS: { value: Category; label: string }[] = [
  { value: "cafe", label: "Cafés" },
  { value: "study_space", label: "Study Spaces" },
];

export function SegmentedTabs({
  value,
  onChange,
}: {
  value: Category;
  onChange: (v: Category) => void;
}) {
  return (
    <div
      className="relative inline-flex rounded-full p-1 gap-1"
      style={{ background: "var(--atmo-bg-2)" }}
      role="tablist"
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className="relative z-[1] rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
            style={{ color: active ? "var(--atmo-accent-contrast)" : "var(--atmo-text-soft)" }}
          >
            {active && (
              <motion.span
                layoutId="segmented-pill"
                className="absolute inset-0 rounded-full z-[-1]"
                style={{ background: "var(--atmo-accent)" }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
