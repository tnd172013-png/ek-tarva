import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { hhmm, isFridayOrSaturday, slotCount, weekdayName } from "@/lib/events";

// List every event day (published or not) with its slot + booking counts.
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: days, error } = await supabase
    .from("event_days")
    .select("*")
    .order("event_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }

  const { data: bookings } = await supabase
    .from("slot_bookings")
    .select("event_day_id")
    .eq("status", "booked");

  const bookedByDay = new Map<string, number>();
  for (const b of bookings ?? []) {
    bookedByDay.set(b.event_day_id, (bookedByDay.get(b.event_day_id) ?? 0) + 1);
  }

  const events = (days ?? []).map((d) => {
    const start = hhmm(d.start_time);
    const end = hhmm(d.end_time);
    return {
      id: d.id,
      event_date: d.event_date,
      weekday: weekdayName(d.event_date),
      start_time: start,
      end_time: end,
      slot_duration_min: d.slot_duration_min,
      is_published: d.is_published,
      total_slots: slotCount(start, end, d.slot_duration_min),
      booked: bookedByDay.get(d.id) ?? 0,
      created_at: d.created_at,
    };
  });

  return NextResponse.json({ events });
}

// Create a new event day.
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    event_date?: string;
    start_time?: string;
    end_time?: string;
    slot_duration_min?: number;
    is_published?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { event_date, start_time, end_time } = body;
  const duration = Number(body.slot_duration_min) || 10;

  if (!event_date || !start_time || !end_time) {
    return NextResponse.json(
      { error: "Date, start time and end time are all required." },
      { status: 400 }
    );
  }

  if (!isFridayOrSaturday(event_date)) {
    return NextResponse.json(
      { error: "Events can only be held on a Friday or Saturday." },
      { status: 400 }
    );
  }

  if (duration <= 0) {
    return NextResponse.json(
      { error: "Minutes per person must be greater than zero." },
      { status: 400 }
    );
  }

  const count = slotCount(start_time, end_time, duration);
  if (count < 1) {
    return NextResponse.json(
      { error: "The time range is too short to fit even one slot." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("event_days")
    .insert({
      event_date,
      start_time,
      end_time,
      slot_duration_min: duration,
      is_published: body.is_published ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Could not create the event." }, { status: 500 });
  }

  return NextResponse.json({ event: data, total_slots: count });
}
