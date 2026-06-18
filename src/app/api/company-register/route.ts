import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateSlots, hhmm } from "@/lib/events";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.companyName || !body.contactName || !body.email || !body.mobile) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const eventDayId: string | undefined = body.eventDayId;
    const slotIndex = Number(body.slotIndex);

    if (!eventDayId || !Number.isInteger(slotIndex) || slotIndex < 0) {
      return NextResponse.json(
        { error: "Please pick an event day and a time slot." },
        { status: 400 }
      );
    }

    // Validate the chosen day is published, upcoming, and the slot is in range.
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

    const { data: day } = await supabase
      .from("event_days")
      .select("*")
      .eq("id", eventDayId)
      .single();

    if (!day || !day.is_published || day.event_date < today) {
      return NextResponse.json(
        { error: "That event is no longer open for booking. Please pick another." },
        { status: 409 }
      );
    }

    const slots = generateSlots(hhmm(day.start_time), hhmm(day.end_time), day.slot_duration_min);
    const slot = slots.find((s) => s.index === slotIndex);
    if (!slot) {
      return NextResponse.json(
        { error: "That slot doesn't exist for this event. Please pick another." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("slot_bookings").insert({
      event_day_id: eventDayId,
      slot_index: slotIndex,
      slot_start: slot.start,
      slot_end: slot.end,
      company_name: body.companyName,
      contact_name: body.contactName,
      location: body.location || null,
      mobile: body.mobile,
      email: body.email,
      team_full_time: body.teamFullTime || null,
      team_part_time: body.teamPartTime || null,
      team_freelance: body.teamFreelance || null,
      roles: body.roles ?? null,
      hire_other_domain: !!body.hireOtherDomain,
      other_domains: body.otherDomains ?? null,
      hire_interns: !!body.hireInterns,
      intern_domain: body.internDomain || null,
      intern_count: body.internCount || null,
      intern_stipend: body.internStipend || null,
      intern_duration: body.internDuration || null,
      notes: body.notes || null,
      status: "booked",
    });

    if (error) {
      // 23505 = unique violation. Two indexes can trip it.
      if (error.code === "23505") {
        if (error.message.includes("email")) {
          return NextResponse.json(
            { error: "This email has already booked a slot for this event." },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: "That slot was just taken. Please pick another one." },
          { status: 409 }
        );
      }
      console.error("Booking insert error:", error);
      return NextResponse.json({ error: "Could not save your booking." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Company register error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
