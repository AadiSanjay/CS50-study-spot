"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { currentPeriod, type Period } from "@/lib/theme";

type Override = Period | "auto";

const ThemeContext = createContext<{
  period: Period;
  override: Override;
  setOverride: (o: Override) => void;
}>({ period: "afternoon", override: "auto", setOverride: () => {} });

const STORAGE_KEY = "perch-theme-override";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverrideState] = useState<Override>("auto");
  const [period, setPeriod] = useState<Period>("afternoon");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // ignore — private mode / blocked storage
    }
    if (saved === "morning" || saved === "afternoon" || saved === "night") {
      setOverrideState(saved);
    }
  }, []);

  useEffect(() => {
    function apply() {
      const next = override === "auto" ? currentPeriod() : override;
      setPeriod(next);
      document.documentElement.setAttribute("data-period", next);
    }
    apply();
    const id = setInterval(apply, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [override]);

  function setOverride(o: Override) {
    setOverrideState(o);
    try {
      if (o === "auto") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, o);
    } catch {
      // ignore
    }
  }

  return (
    <ThemeContext.Provider value={{ period, override, setOverride }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAtmosphere() {
  return useContext(ThemeContext);
}
