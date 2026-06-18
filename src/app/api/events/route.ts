import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateSlots, hhmm, weekdayName } from "@/lib/events";

// Public endpoint: published, upcoming event days with per-slot availability.
// Consumed by the company booking form on /companies.
export async function GET() {
  // "Today" in IST so an event isn't hidden before the day is actually over.
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const { data: days, error } = await supabase
    .from("event_days")
    .select("*")
    .eq("is_published", true)
    .gte("event_date", today)
    .order("event_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }

  if (!days || days.length === 0) {
    return NextResponse.json({ events: [] });
  }

  const { data: bookings } = await supabase
    .from("slot_bookings")
    .select("event_day_id, slot_index")
    .eq("status", "booked")
    .in(
      "event_day_id",
      days.map((d) => d.id)
    );

  const bookedByDay = new Map<string, Set<number>>();
  for (const b of bookings ?? []) {
    if (!bookedByDay.has(b.event_day_id)) bookedByDay.set(b.event_day_id, new Set());
    bookedByDay.get(b.event_day_id)!.add(b.slot_index);
  }

  const events = days.map((d) => {
    const start = hhmm(d.start_time);
    const end = hhmm(d.end_time);
    const taken = bookedByDay.get(d.id) ?? new Set<number>();
    const slots = generateSlots(start, end, d.slot_duration_min).map((s) => ({
      ...s,
      available: !taken.has(s.index),
    }));

    return {
      id: d.id,
      event_date: d.event_date,
      weekday: weekdayName(d.event_date),
      start_time: start,
      end_time: end,
      slot_duration_min: d.slot_duration_min,
      slots,
      available_count: slots.filter((s) => s.available).length,
    };
  });

  return NextResponse.json({ events });
}
