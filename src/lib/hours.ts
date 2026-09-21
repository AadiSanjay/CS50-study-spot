import type { Hours } from "./types";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const TIME_ZONE = "America/Chicago";

function chicagoParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdayShort = get("weekday").toLowerCase(); // "sun", "mon", ...
  const hour = get("hour");
  const minute = get("minute");
  return { weekdayShort, time: `${hour}:${minute}` };
}

/** Maps Intl's 3-letter weekday to our Hours keys. */
function dayKeyFromShort(short: string): keyof Hours {
  const map: Record<string, keyof Hours> = {
    sun: "sun",
    mon: "mon",
    tue: "tue",
    wed: "wed",
    thu: "thu",
    fri: "fri",
    sat: "sat",
  };
  return map[short] ?? "mon";
}

export function isOpenNow(hours: Hours, now: Date = new Date()): boolean {
  const { weekdayShort, time } = chicagoParts(now);
  const day = hours[dayKeyFromShort(weekdayShort)];
  if ("closed" in day && day.closed) return false;
  if (!("open" in day)) return false;
  // Zero-padded 24h "HH:MM" strings compare correctly as plain strings.
  return time >= day.open && time < day.close;
}

export function todayHoursLabel(hours: Hours, now: Date = new Date()): string {
  const { weekdayShort } = chicagoParts(now);
  const day = hours[dayKeyFromShort(weekdayShort)];
  if ("closed" in day && day.closed) return "Closed today";
  if (!("open" in day)) return "Closed today";
  return `${formatTime(day.open)} – ${formatTime(day.close)}`;
}

function formatTime(hhmm: string): string {
  if (hhmm === "24:00") return "12:00 AM";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export const WEEK_ORDER: (keyof Hours)[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export const DAY_LABELS: Record<keyof Hours, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export function formatDayHours(day: Hours[keyof Hours]): string {
  if ("closed" in day && day.closed) return "Closed";
  if (!("open" in day)) return "Closed";
  return `${formatTime(day.open)} – ${formatTime(day.close)}`;
}

export function currentChicagoHour(now: Date = new Date()): number {
  const { time } = chicagoParts(now);
  return Number(time.split(":")[0]);
}

// unused export kept for symmetry with DAY_KEYS if needed elsewhere
export { DAY_KEYS };
