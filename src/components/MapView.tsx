"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import type { SpotWithMeta } from "./SpotCard";
import type { Period } from "@/lib/theme";

const BUSY_COLOR = ["", "#2F4D3A", "#4C6F58", "#B8842C", "#C97C4B", "#B9683A"];

const TILE_URL: Record<"light" | "dark", string> = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

function markerIcon(color: string, active: boolean) {
  const size = active ? 22 : 16;
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block;width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,.35);
    "></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitBounds({ spots }: { spots: SpotWithMeta[] }) {
  const map = useMap();
  useEffect(() => {
    if (spots.length === 0) return;
    const bounds = L.latLngBounds(spots.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 16 });
  }, [spots, map]);
  return null;
}

export default function MapView({
  spots,
  hoveredId,
  onMarkerClick,
  onMarkerHover,
  period,
}: {
  spots: SpotWithMeta[];
  hoveredId: string | null;
  onMarkerClick: (id: string) => void;
  onMarkerHover: (id: string | null) => void;
  period: Period;
}) {
  const tileStyle = period === "night" ? "dark" : "light";
  const icons = useMemo(() => {
    const map = new Map<string, L.DivIcon>();
    for (const s of spots) {
      map.set(s.id, markerIcon(BUSY_COLOR[s.busyness.level], s.id === hoveredId));
    }
    return map;
  }, [spots, hoveredId]);

  return (
    <MapContainer
      center={[40.109, -88.227]}
      zoom={14}
      scrollWheelZoom
      className="h-full w-full"
      attributionControl={false}
    >
      <TileLayer url={TILE_URL[tileStyle]} />
      <FitBounds spots={spots} />
      {spots.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={icons.get(s.id)}
          eventHandlers={{
            click: () => onMarkerClick(s.id),
            mouseover: () => onMarkerHover(s.id),
            mouseout: () => onMarkerHover(null),
          }}
        />
      ))}
    </MapContainer>
  );
}
