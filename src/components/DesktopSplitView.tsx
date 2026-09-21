"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { SpotCard, type SpotWithMeta } from "./SpotCard";
import { useAtmosphere } from "./ThemeProvider";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-sm text-[var(--atmo-text-soft)]">
      Loading map…
    </div>
  ),
});

export function DesktopSplitView({
  spots,
  onOpenDetail,
}: {
  spots: SpotWithMeta[];
  onOpenDetail: (id: string) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [markerSelectedId, setMarkerSelectedId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { period } = useAtmosphere();

  function handleMarkerClick(id: string) {
    setMarkerSelectedId(id);
    cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => setMarkerSelectedId((cur) => (cur === id ? null : cur)), 1600);
  }

  return (
    <div className="flex gap-5 h-[calc(100vh-160px)]">
      <div className="w-[40%] overflow-y-auto pr-1 space-y-3">
        {spots.length === 0 && (
          <p className="text-sm py-8 text-center" style={{ color: "var(--atmo-text-soft)" }}>
            No spots match right now — try clearing a filter.
          </p>
        )}
        {spots.map((spot, i) => (
          <motion.div
            key={spot.id}
            ref={(el) => {
              cardRefs.current[spot.id] = el;
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.3 }}
          >
            <SpotCard
              spot={spot}
              showArt
              highlighted={spot.id === hoveredId || spot.id === markerSelectedId}
              onClick={() => onOpenDetail(spot.id)}
              onMouseEnter={() => setHoveredId(spot.id)}
              onMouseLeave={() => setHoveredId((cur) => (cur === spot.id ? null : cur))}
            />
          </motion.div>
        ))}
      </div>
      <div
        className="w-[60%] rounded-xl2 overflow-hidden border"
        style={{ borderColor: "var(--atmo-line)" }}
      >
        <MapView
          spots={spots}
          hoveredId={hoveredId}
          onMarkerClick={handleMarkerClick}
          onMarkerHover={setHoveredId}
          period={period}
        />
      </div>
    </div>
  );
}
