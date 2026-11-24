import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { verified } = await req.json();

  // Razorpay rows are settled by signature + webhook only; never by hand.
  const { data, error } = await supabase
    .from("registrations")
    .update({ payment_status: verified ? "paid" : "pending" })
    .eq("id", id)
    .neq("payment_method", "razorpay")
    .select("id, payment_status")
    .single();

  if (error || !data) {
    console.error("Verify update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, paymentStatus: data.payment_status });
}
