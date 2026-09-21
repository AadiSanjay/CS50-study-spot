export type Period = "morning" | "afternoon" | "night";

export function periodForHour(hour: number): Period {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 18) return "afternoon";
  return "night";
}

export function currentPeriod(): Period {
  return periodForHour(new Date().getHours());
}

export const PERIOD_LABEL: Record<Period, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  night: "Night",
};
