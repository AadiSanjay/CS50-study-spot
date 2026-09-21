"use client";

import { motion } from "framer-motion";

const WIDTH = 240;
const HEIGHT = 56;
const PAD = 4;

export function Sparkline({
  curve,
  currentHour,
  currentLevel,
}: {
  curve: number[]; // 24 values, 1-5
  currentHour: number;
  currentLevel: number;
}) {
  const points = curve.map((v, i) => {
    const x = PAD + (i / (curve.length - 1)) * (WIDTH - PAD * 2);
    const y = PAD + (1 - (v - 1) / 4) * (HEIGHT - PAD * 2);
    return [x, y];
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");

  const cx = points[Math.min(currentHour, points.length - 1)][0];
  const cy =
    PAD + (1 - (currentLevel - 1) / 4) * (HEIGHT - PAD * 2);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-14"
      role="img"
      aria-label="Typical busyness by hour, with the current level highlighted"
    >
      <motion.path
        d={path}
        fill="none"
        stroke="var(--atmo-line)"
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r={4}
        fill="var(--atmo-accent)"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      />
    </svg>
  );
}
