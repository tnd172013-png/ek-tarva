import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const filter = req.nextUrl.searchParams.get("filter");

  let query = supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter === "paid") {
    query = query.eq("payment_status", "paid");
  } else if (filter === "pending") {
    query = query.eq("payment_status", "pending");
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return new NextResponse("No registrations found.", { status: 200 });
  }

  const headers = ["Full Name", "Email", "Phone", "LinkedIn", "Role Preference", "Payment Status", "UTR", "Registered At"];
  const rows = data.map((r) => [
    r.full_name,
    r.email,
    r.phone,
    r.linkedin_url || "",
    r.role_preference || "",
    r.payment_status,
    r.utr || "",
    r.created_at,
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell: string) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  const bom = "\uFEFF";

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registrations-${filter || "all"}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
