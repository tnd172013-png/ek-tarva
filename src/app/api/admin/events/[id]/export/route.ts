import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { toCsv } from "@/lib/csv";

type Ctx = { params: Promise<{ id: string }> };
type RoleRow = { count?: string; package?: string; skills?: string };
type OtherDomain = { name?: string; count?: string; package?: string };

// Download the bookings for a single event day as a CSV (one row per company).
export async function GET(req: NextRequest, ctx: Ctx) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const { data: day } = await supabase
    .from("event_days")
    .select("event_date")
    .eq("id", id)
    .single();

  const { data: bookings, error } = await supabase
    .from("slot_bookings")
    .select("*")
    .eq("event_day_id", id)
    .eq("status", "booked")
    .order("slot_index", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }

  if (!bookings || bookings.length === 0) {
    return new NextResponse("No bookings yet for this event.", { status: 200 });
  }

  const headers = [
    "Slot",
    "Start",
    "End",
    "Company",
    "Contact",
    "Location",
    "Mobile",
    "Email",
    "Total Hires",
    "Team (FT/PT/Freelance)",
    "Roles Hiring",
    "Other Domains",
    "Interns",
    "Notes",
    "Booked At",
  ];

  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const rows = bookings.map((b) => {
    const roles = (b.roles ?? {}) as Record<string, RoleRow>;
    const rolesText = Object.entries(roles)
      .filter(([, r]) => r && (r.count || r.package || r.skills))
      .map(
        ([name, r]) =>
          `${name}: ${[r.count && `${r.count} ppl`, r.package, r.skills]
            .filter(Boolean)
            .join(", ")}`
      )
      .join(" | ");

    const others = (b.other_domains ?? []) as OtherDomain[];
    const othersText = b.hire_other_domain
      ? others
          .filter((d) => d.name || d.count || d.package)
          .map((d) => `${d.name}: ${[d.count && `${d.count} ppl`, d.package].filter(Boolean).join(", ")}`)
          .join(" | ")
      : "";

    const internsText = b.hire_interns
      ? [
          b.intern_domain,
          b.intern_count && `${b.intern_count} interns`,
          b.intern_stipend && `₹${b.intern_stipend}`,
          b.intern_duration,
        ]
          .filter(Boolean)
          .join(", ")
      : "";

    // Total people this company wants to hire across roles, other domains, and interns.
    const totalHires =
      Object.values(roles).reduce((sum, r) => sum + num(r?.count), 0) +
      (b.hire_other_domain ? others.reduce((sum, d) => sum + num(d?.count), 0) : 0) +
      (b.hire_interns ? num(b.intern_count) : 0);

    return [
      b.slot_index + 1,
      b.slot_start ?? "",
      b.slot_end ?? "",
      b.company_name,
      b.contact_name,
      b.location ?? "",
      b.mobile,
      b.email,
      totalHires,
      [b.team_full_time, b.team_part_time, b.team_freelance].map((v) => v || "0").join(" / "),
      rolesText,
      othersText,
      internsText,
      b.notes ?? "",
      b.created_at,
    ];
  });

  const csv = toCsv(headers, rows);
  const fileDate = day?.event_date ?? new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bookings-${fileDate}.csv"`,
    },
  });
}
