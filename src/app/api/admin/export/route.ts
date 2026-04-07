import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  // Simple secret key auth — check query param
  const key = req.nextUrl.searchParams.get("key");
  if (key !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const filter = req.nextUrl.searchParams.get("filter"); // "paid", "pending", or "all"

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

  // Build CSV
  const headers = ["Full Name", "Email", "Phone", "LinkedIn", "Payment Status", "Razorpay Payment ID", "Registered At"];
  const rows = data.map((r) => [
    r.full_name,
    r.email,
    r.phone,
    r.linkedin_url || "",
    r.payment_status,
    r.razorpay_payment_id || "",
    r.created_at,
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell: string) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  // Add BOM for Excel to detect UTF-8
  const bom = "\uFEFF";

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registrations-${filter || "all"}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
