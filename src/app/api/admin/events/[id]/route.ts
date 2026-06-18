import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { isFridayOrSaturday, slotCount } from "@/lib/events";

type Ctx = { params: Promise<{ id: string }> };

// Update an event day — used for publish/unpublish and editing the time range.
export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

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

  const updates: Record<string, unknown> = {};

  if (body.event_date !== undefined) {
    if (!isFridayOrSaturday(body.event_date)) {
      return NextResponse.json(
        { error: "Events can only be held on a Friday or Saturday." },
        { status: 400 }
      );
    }
    updates.event_date = body.event_date;
  }
  if (body.start_time !== undefined) updates.start_time = body.start_time;
  if (body.end_time !== undefined) updates.end_time = body.end_time;
  if (body.slot_duration_min !== undefined) {
    const duration = Number(body.slot_duration_min);
    if (!(duration > 0)) {
      return NextResponse.json(
        { error: "Minutes per person must be greater than zero." },
        { status: 400 }
      );
    }
    updates.slot_duration_min = duration;
  }
  if (body.is_published !== undefined) updates.is_published = body.is_published;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  // If the time range / duration is changing, make sure it still yields a slot.
  if (
    updates.start_time !== undefined ||
    updates.end_time !== undefined ||
    updates.slot_duration_min !== undefined
  ) {
    const { data: current } = await supabase
      .from("event_days")
      .select("start_time, end_time, slot_duration_min")
      .eq("id", id)
      .single();

    if (!current) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const start = (updates.start_time as string) ?? current.start_time;
    const end = (updates.end_time as string) ?? current.end_time;
    const duration =
      (updates.slot_duration_min as number) ?? current.slot_duration_min;

    if (slotCount(start, end, duration) < 1) {
      return NextResponse.json(
        { error: "That time range is too short to fit even one slot." },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabase
    .from("event_days")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update event error:", error);
    return NextResponse.json({ error: "Could not update the event." }, { status: 500 });
  }

  return NextResponse.json({ event: data });
}

// Delete an event day. Bookings are removed via ON DELETE CASCADE.
export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const { error } = await supabase.from("event_days").delete().eq("id", id);

  if (error) {
    console.error("Delete event error:", error);
    return NextResponse.json({ error: "Could not delete the event." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
