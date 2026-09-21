"use client";

import { motion } from "framer-motion";
import type { BusynessResult } from "@/lib/types";
import { busynessBasisLabel } from "./BusynessPill";

const LEVEL_LABEL = ["", "Quiet", "Calm", "Moderate", "Busy", "Packed"];

export function BusynessMeter({ busyness }: { busyness: BusynessResult }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-lg font-medium" style={{ color: "var(--atmo-text)" }}>
          {LEVEL_LABEL[busyness.level]}
        </span>
        <span className="text-xs" style={{ color: "var(--atmo-text-soft)" }}>
          {busynessBasisLabel(busyness)}
        </span>
      </div>
      <div
        className="h-2.5 w-full rounded-full overflow-hidden"
        style={{ background: "var(--atmo-bg-2)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--atmo-accent)" }}
          initial={{ width: 0 }}
          animate={{ width: `${(busyness.level / 5) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
