"use client";

import { useEffect, useRef } from "react";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && target === inputRef.current) {
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative flex-1 max-w-xs">
      <input
        ref={inputRef}
        id="spot-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search spots or tags…"
        className="w-full rounded-full border px-3.5 py-1.5 text-sm outline-none transition-colors"
        style={{
          background: "var(--atmo-surface)",
          borderColor: "var(--atmo-line)",
          color: "var(--atmo-text)",
        }}
      />
      {!value && (
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] rounded border px-1.5 py-0.5"
          style={{ borderColor: "var(--atmo-line)", color: "var(--atmo-text-soft)" }}>
          /
        </kbd>
      )}
    </div>
  );
}
