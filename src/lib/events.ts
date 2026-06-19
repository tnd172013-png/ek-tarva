// Shared, framework-free helpers for event days and slots.
// Used on both the server (validation) and client (display).

export type Slot = { index: number; start: string; end: string };

export type EventDay = {
  id: string;
  event_date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  slot_duration_min: number;
  is_published: boolean;
};

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Postgres `time` columns come back as "HH:MM:SS"; trim to "HH:MM".
export function hhmm(time: string): string {
  return time.slice(0, 5);
}

function toMinutes(time: string): number {
  const [h, m] = hhmm(time).split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// "17:30" -> "5:30 PM". Display only; stored/derived values stay 24-hour.
export function formatTime12(time: string): string {
  const [h, m] = hhmm(time).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

// Derive the list of slots that fit inside [startTime, endTime).
// A trailing gap smaller than one full slot is dropped.
export function generateSlots(
  startTime: string,
  endTime: string,
  durationMin: number
): Slot[] {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    !(durationMin > 0) ||
    end <= start
  ) {
    return [];
  }

  const slots: Slot[] = [];
  let index = 0;
  for (let t = start; t + durationMin <= end; t += durationMin) {
    slots.push({ index, start: fromMinutes(t), end: fromMinutes(t + durationMin) });
    index++;
  }
  return slots;
}

export function slotCount(
  startTime: string,
  endTime: string,
  durationMin: number
): number {
  return generateSlots(startTime, endTime, durationMin).length;
}

// 0 = Sunday … 5 = Friday, 6 = Saturday. Parsed from parts to avoid TZ drift.
export function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function weekdayName(dateStr: string): string {
  return WEEKDAYS[weekdayOf(dateStr)] ?? "";
}

export function isFridayOrSaturday(dateStr: string): boolean {
  const w = weekdayOf(dateStr);
  return w === 5 || w === 6;
}

// Human label, e.g. "Sat, 20 Apr 2026".
export function formatEventDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
